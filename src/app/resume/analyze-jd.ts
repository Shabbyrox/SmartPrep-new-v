// src/app/resume/analyze-jd.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'
import { createClient } from '@/utils/supabase/server'
// @ts-ignore
import PDFParser from 'pdf2json'

export async function analyzeResumeWithJD(formData: FormData) {
    const file = formData.get('file') as File
    const jobRole = formData.get('jobRole') as string
    const jobDescription = formData.get('jobDescription') as string

    if (!file || !jobRole || !jobDescription) return { error: 'Missing fields' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Upload File
    let publicUrl = null
    if (user) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/jd_${Date.now()}.${fileExt}`
        
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
        You are an expert ATS (Applicant Tracking System) and Hiring Manager.
        Analyze the following resume against the provided Job Description (JD) for the role of "${jobRole}".
        
        Job Description:
        ${jobDescription}

        Resume Text:
        ${resumeText}

        IMPORTANT: Respond ONLY with a valid JSON object in this exact format. Do not include any text before or after the JSON.
        
        Structure:
        {
            "matchScore": number (0-100),
            "missingKeywords": ["string", "string", "string"],
            "feedback": {
                "summary": "A brief 2-sentence summary of the candidate's fit.",
                "strengths": ["Strong point 1", "Strong point 2", "Strong point 3"],
                "gaps": ["Missing skill 1", "Experience gap 1", "Missing certification"],
                "recommendations": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3"]
            }
        }
        `

       const text = await generateContentWithRetry(prompt)

        // JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let jsonStr = jsonMatch ? jsonMatch[0] : text;
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => (['\n','\t','\r'].includes(char) ? char : ''));

        try {
            const result = JSON.parse(jsonStr)
            
            if (user && result) {
                // 👇 MERGE missingKeywords into the feedback object so it is saved!
                const feedbackToStore = {
                    ...result.feedback,
                    missingKeywords: result.missingKeywords 
                }

                await supabase.from('resume_analyses').insert({
                    user_id: user.id,
                    overall_score: result.matchScore,
                    section_scores: {}, 
                    feedback: JSON.stringify(feedbackToStore), // Now contains keywords
                    source: 'jd_match',
                    job_role: jobRole,
                    file_url: publicUrl,
                    created_at: new Date().toISOString()
                })

                // ---------------------------------------------------------
                // 3. [NEW] CLEANUP LOGIC (Keep only latest 5 JD Scans) 🧹
                // ---------------------------------------------------------
                
                // A. Fetch all JD history for this user
                const { data: history } = await supabase
                    .from('resume_analyses')
                    .select('id, file_url')
                    .eq('user_id', user.id)
                    .eq('source', 'jd_match') // Only clean JD matches, don't touch quick scans
                    .order('created_at', { ascending: false })

                // B. Check limit
                if (history && history.length > 5) {
                    const recordsToDelete = history.slice(5) 
                    
                    // C. Delete Files
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

                    // D. Delete DB Records
                    const idsToDelete = recordsToDelete.map(r => r.id)
                    await supabase.from('resume_analyses').delete().in('id', idsToDelete)
                }
                // ---------------------------------------------------------
            }
            return result
        } catch (e) {
            console.log('JSON Parse Error', jsonStr)
            return { error: 'AI returned invalid JSON. Please try again.' }
        }

    } catch (error: any) {
        console.error('Error analyzing Resume with JD:', error)
        return { error: error.message || 'Failed to analyze resume' }
    }
}