// src/app/resume/analyze-jd.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'
import { createClient } from '@/utils/supabase/server'
// @ts-ignore
import PDFParser from 'pdf2json'
// 👇 Import Limiter
import { checkDailyLimit, incrementDailyLimit } from '@/utils/usage-limiter'

export async function analyzeResumeWithJD(formData: FormData) {
    const file = formData.get('file') as File
    const jobRole = formData.get('jobRole') as string
    const jobDescription = formData.get('jobDescription') as string

    if (!file || !jobRole || !jobDescription) {
        return { error: 'Missing file or job details' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. CHECK LIMIT 🛑
    const limitState = await checkDailyLimit(supabase, user.id, 'jd_match_count')
    if (!limitState.allowed) {
        return { error: limitState.message }
    }

    // Upload file (logic remains same)
    let publicUrl = null
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/jd-match/${Date.now()}.${fileExt}`
    
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
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let jsonStr = jsonMatch ? jsonMatch[0] : text;
        jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => (['\n','\t','\r'].includes(char) ? char : ''));

        const result = JSON.parse(jsonStr)

        if (user && result) {
            await supabase.from('jd_matches').insert({
                user_id: user.id,
                job_role: jobRole,
                overall_score: result.matchScore,
                feedback: JSON.stringify({
                    ...result.feedback,
                    missingKeywords: result.missingKeywords
                }),
                file_url: publicUrl,
                created_at: new Date().toISOString()
            })

            // 2. INCREMENT LIMIT ✅
            await incrementDailyLimit(supabase, user.id, 'jd_match_count')
        }

        return result

    } catch (error: any) {
        console.error("JD Match Error:", error)
        return { error: error.message || 'Failed to analyze JD match' }
    }
}