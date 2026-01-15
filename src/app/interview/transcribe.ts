// src/app/interview/transcribe.ts
'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY as string
const genAI = new GoogleGenerativeAI(apiKey)

// Now accepts mimeType as a second argument
export async function transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

        // Clean base64 string
        const base64Data = audioBase64.split(',')[1] || audioBase64

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType, 
                    data: base64Data
                }
            },
            { text: "Transcribe this audio exactly as spoken. Return only the text. If there is no speech, return nothing." }
        ])

        const response = await result.response
        const text = response.text()
        
        return { text: text.trim() }

    } catch (error: any) {
        console.error('Transcription Error:', error)
        return { error: 'Failed to transcribe audio.' }
    }
}