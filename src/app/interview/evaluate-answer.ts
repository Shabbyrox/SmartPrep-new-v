// src/app/interview/evaluate-answer.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'

export async function evaluateAnswer(
    question: string,
    answer: string,
    jobRole: string
) {
    try {
        const prompt = `
You are an expert interviewer evaluating a candidate's answer for the role of "${jobRole}".

Question: ${question}
Candidate's Answer: ${answer}

Provide a brief evaluation. Respond ONLY with a valid JSON object in this exact format. Do not include any text before or after the JSON. Do not use markdown code blocks. Ensure all strings are properly escaped and no trailing commas.
{
    "score": number (0-10),
    "feedback": "Brief 1-2 sentence feedback on the answer quality"
}
`

        const text = await generateContentWithRetry(prompt)

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : text

        try {
            const evaluation = JSON.parse(jsonStr)
            return evaluation
        } catch (e) {
            console.log('JSON parse failed in evaluate-answer.ts, raw response:', jsonStr)
            return { error: 'AI returned invalid JSON. Please try again.' }
        }

    } catch (error: any) {
        console.error('Error evaluating answer:', error)
        return { error: error.message || 'Failed to evaluate answer' }
    }
}
