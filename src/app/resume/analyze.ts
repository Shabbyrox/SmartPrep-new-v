// src/app/resume/analyze.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'
import { createClient } from '@/utils/supabase/server'

export async function analyzeResume(resumeContent: any) {
    const prompt = `
    You are an expert Resume Reviewer. Analyze the following resume data and provide constructive feedback with scores.
    
    CRITICAL INSTRUCTION: Respond ONLY with a raw JSON object. 
    
    Structure:
    {
        "overallScore": number (0-100),
        "sectionScores": {
            "personalInfo": number (0-100),
            "education": number (0-100),
            "projects": number (0-100),
            "skills": number (0-100),
            "achievements": number (0-100),
            "co-curricular": number (0-100)
        },
        // 👇 CHANGED: Structured Feedback Arrays
        "feedback": {
            "strengths": ["point 1", "point 2"],
            "weaknesses": ["point 1", "point 2"],
            "suggestions": ["action 1", "action 2"]
        }
    }

    Resume Data:
    ${JSON.stringify(resumeContent, null, 2)}
  `

    try {
        const text = await generateContentWithRetry(prompt)

        // Clean JSON response
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            cleanText = cleanText.substring(firstOpen, lastClose + 1);
        }

        try {
            const result = JSON.parse(cleanText)
            
            // Save to database
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                // We stringify the feedback object to store it
                await supabase.from('resume_analyses').insert({
                    user_id: user.id,
                    overall_score: result.overallScore,
                    section_scores: result.sectionScores,
                    feedback: JSON.stringify(result.feedback), // Store as string
                    source: 'quick_analysis',
                    created_at: new Date().toISOString()
                })
            }
            return result

        } catch (e) {
            console.error('JSON Parsing Failed', text)
            return { error: 'AI returned invalid JSON. Please try again.' }
        }
    } catch (error: any) {
        console.error('Error analyzing resume:', error)
        return { error: error.message || 'Failed to analyze resume' }
    }
}