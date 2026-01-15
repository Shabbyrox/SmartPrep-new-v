// src/utils/gemini.ts
'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY not configured')
}

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateContentWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  console.log("Debug - API Key exists:", !!apiKey);

  let attempt = 0
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  while (attempt < maxRetries) {
    try {
      // Gemini's generateContent is the equivalent of chat.completions.create
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return text?.trim() || ''
      
    } catch (error: any) {
      // Gemini often throws a 429 or 503 for rate limits/overload
      // We check for these status codes or specific error messages
      const isRateLimit = error.status === 429 || 
                          error.message?.includes('429') || 
                          error.message?.includes('Resource has been exhausted')

      if (isRateLimit || error.status === 503) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Gemini Rate limited/Busy, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        attempt++
      } else {
        console.error("Gemini API Error:", error)
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}