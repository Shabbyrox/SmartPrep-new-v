// src/app/interview/generate-interview-question.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'

interface ConversationTurn {
    question: string
    answer: string
}

export async function generateInterviewQuestion(
    jobRole: string,
    conversationHistory: ConversationTurn[],
    questionNumber: number
) {
    try {
        const conversationContext = conversationHistory.length > 0
            ? conversationHistory.map((turn, idx) => `Q${idx + 1}: ${turn.question}\nA${idx + 1}: ${turn.answer}`).join('\n\n')
            : 'No previous questions yet.'

        const prompt = `
You are an experienced technical interviewer conducting an interview for the role of "${jobRole}".

This is question #${questionNumber} of the interview.

Previous conversation:
${conversationContext}

Generate the next interview question. Follow these guidelines:
- Start with easier questions and progressively get harder
- For early questions (1-2), ask about background and experience
- For mid questions (3-4), ask technical questions specific to ${jobRole}
- For later questions (5+), ask scenario-based or problem-solving questions
- Be professional, clear, and conversational
- Keep questions concise (1-2 sentences)

IMPORTANT: Respond with ONLY the question text. No additional formatting or explanation.
`

        const question = await generateContentWithRetry(prompt)

        return { question }

    } catch (error: any) {
        console.error('Error generating question:', error)
        return { error: error.message || 'Failed to generate question' }
    }
}
