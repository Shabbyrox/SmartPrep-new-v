// src/app/resume/analyze-pdf.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'
import { createClient } from '@/utils/supabase/server' // 👈 Added Import
// @ts-ignore
import PDFParser from 'pdf2json'

export async function analyzePdfResume(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Upload File to Supabase Storage
    let publicUrl = null
    if (user) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file)

        if (!uploadError) {
            const { data } = supabase.storage.from('resumes').getPublicUrl(filePath)
            publicUrl = data.publicUrl
        }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfParser = new PDFParser(null, true)
        const resumeText = await new Promise<string>((resolve, reject) => {
            pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError))
            pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                resolve(pdfParser.getRawTextContent())
            })
            pdfParser.parseBuffer(buffer)
        })

        const prompt = `
        Analyze the following resume text and provide constructive feedback with scores and categorized insights.
        
        IMPORTANT: Respond ONLY with a valid JSON object. Do not use markdown code blocks.
        
        Structure:
        {
            "overallScore": number (0-100),
            "sectionScores": {
                "personalInfo": number (0-100),
                "education": number (0-100),
                "projects": number (0-100),
                "skills": number (0-100),
                "achievements": number (0-100),
                "coCurricular": number (0-100)
            },
            "recommendedJobRoles": ["string", "string", "string"], 
            // 👇 NEW FEEDBACK STRUCTURE
            "feedback": {
                "strengths": ["point 1", "point 2", "point 3"],
                "weaknesses": ["point 1", "point 2"],
                "improvements": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"]
            }
        }

        Instructions:
        1. **recommendedJobRoles**: Provide 3 standard industry job titles that best match the skills found.
        2. **feedback.strengths**: List 3-5 key assets of the resume (e.g., strong impact verbs, quantifiable results, relevant skills).
        3. **feedback.weaknesses**: List 2-4 critical flaws (e.g., lack of metrics, vague descriptions, formatting issues, missing keywords).
        4. **feedback.improvements**: List 3-5 specific, actionable steps the user can take right now to improve the resume and increase their score. Be directive (e.g., "Change bullet point X to use the STAR method").

        Resume Text:
        ${resumeText}
        `

       const text = await generateContentWithRetry(prompt)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let jsonStr = jsonMatch ? jsonMatch[0] : text;
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => (['\n','\t','\r'].includes(char) ? char : ''));

        try {
            const result = JSON.parse(jsonStr)

            if (user && result) {
                // Merging roles into feedback for storage
                const feedbackToStore = {
                    ...result.feedback,
                    recommendedJobRoles: result.recommendedJobRoles
                }

                // 2. Save New Record to DB
                await supabase.from('resume_analyses').insert({
                    user_id: user.id,
                    overall_score: result.overallScore,
                    section_scores: result.sectionScores,
                    feedback: JSON.stringify(feedbackToStore),
                    source: 'pdf_scan',
                    file_url: publicUrl,
                    created_at: new Date().toISOString()
                })

                // ---------------------------------------------------------
                // 3. [NEW] CLEANUP LOGIC (Keep only latest 5) 🧹
                // ---------------------------------------------------------
                
                // A. Fetch all history for this user (Sorted by Newest first)
                const { data: history } = await supabase
                    .from('resume_analyses')
                    .select('id, file_url')
                    .eq('user_id', user.id)
                    .eq('source', 'pdf_scan')
                    .order('created_at', { ascending: false })

                // B. Check if we have more than 5 items
                if (history && history.length > 5) {
                    // Identify the old ones (Index 5 and greater)
                    const recordsToDelete = history.slice(5) 
                    
                    // C. Delete files from Storage Bucket
                    const pathsToDelete = recordsToDelete
                        .map(r => r.file_url)
                        .filter(url => url) // Ensure URL exists
                        .map(url => {
                            // Extract the actual storage path (everything after '/resumes/')
                            // URL format: .../storage/v1/object/public/resumes/[USER_ID]/[FILE].pdf
                            const parts = url.split('/resumes/')
                            return parts[1] 
                        })
                    
                    if (pathsToDelete.length > 0) {
                        await supabase.storage.from('resumes').remove(pathsToDelete)
                    }

                    // D. Delete records from Database
                    const idsToDelete = recordsToDelete.map(r => r.id)
                    await supabase.from('resume_analyses').delete().in('id', idsToDelete)
                }
                // ---------------------------------------------------------
            }
            return result
        } catch (e) {
            console.log('JSON parse failed', jsonStr)
            return { error: 'AI returned invalid JSON' }
        }

    } catch (error: any) {
        console.error('Error analyzing PDF:', error)
        return { error: error.message || 'Failed to analyze PDF' }
    }
}