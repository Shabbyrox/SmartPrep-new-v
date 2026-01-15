// src/app/resume/analyze-pdf.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'
import { createClient } from '@/utils/supabase/server' // 👈 Added Import
// @ts-ignore
import PDFParser from 'pdf2json'
import { checkDailyLimit, incrementDailyLimit } from '@/utils/usage-limiter'

export async function analyzePdfResume(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }
    
    // Optional: Add size check here to prevent large uploads
    if (file.size > 5 * 1024 * 1024) return { error: 'File too large (Max 5MB)' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 🔴 FIX: Guard clause to handle null user
    if (!user) {
        return { error: 'You must be logged in to analyze resumes.' }
    }

    // 1. CHECK LIMIT (Read-only, doesn't charge yet)
    // Now safe to use user.id because we checked !user above
    const limitState = await checkDailyLimit(supabase, user.id, 'pdf_scan_count')
    if (!limitState.allowed) {
        return { error: limitState.message }
    }

    // 2. Upload File to Supabase Storage
    let publicUrl = null
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

    if (!uploadError) {
        const { data } = supabase.storage.from('resumes').getPublicUrl(filePath)
        publicUrl = data.publicUrl
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

            if (result) {
                // Merging roles into feedback for storage
                const feedbackToStore = {
                    ...result.feedback,
                    recommendedJobRoles: result.recommendedJobRoles
                }

                // 3. Save New Record to DB
                await supabase.from('resume_analyses').insert({
                    user_id: user.id,
                    overall_score: result.overallScore,
                    section_scores: result.sectionScores,
                    feedback: JSON.stringify(feedbackToStore),
                    source: 'pdf_scan',
                    file_url: publicUrl,
                    created_at: new Date().toISOString()
                })

                // 4. ✅ SUCCESS: Increment the limit now!
                await incrementDailyLimit(supabase, user.id, 'pdf_scan_count')

                // ---------------------------------------------------------
                // 5. CLEANUP LOGIC (Keep only latest 5)
                // ---------------------------------------------------------
                const { data: history } = await supabase
                    .from('resume_analyses')
                    .select('id, file_url')
                    .eq('user_id', user.id)
                    .eq('source', 'pdf_scan')
                    .order('created_at', { ascending: false })

                if (history && history.length > 5) {
                    const recordsToDelete = history.slice(5) 
                    
                    const pathsToDelete = recordsToDelete
                        .map(r => r.file_url)
                        .filter(url => url)
                        .map(url => {
                            const parts = url.split('/resumes/')
                            return parts[1] 
                        })
                    
                    if (pathsToDelete.length > 0) {
                        await supabase.storage.from('resumes').remove(pathsToDelete)
                    }

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