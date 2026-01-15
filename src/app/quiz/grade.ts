// src/app/quiz/grade.ts
'use server'

import { generateContentWithRetry } from '../../utils/gemini'

export async function gradeCode(question: string, userCode: string) {
  const prompt = `
    You are a strict code grader.
    
    Question: ${question}
    
    User's Code:
    \`\`\`
    ${userCode}
    \`\`\`
    
    Evaluate if the user's code correctly solves the problem.
    Ignore minor formatting issues, but ensure logic and syntax are correct.
    
    Respond ONLY with a valid JSON object in this exact format. Do not include any text before or after the JSON. Do not use markdown code blocks. Ensure all strings are properly escaped and no trailing commas.
    {
      "correct": boolean,
      "feedback": "Short explanation of why it is correct or incorrect"
    }
  `

  try {
    const text = await generateContentWithRetry(prompt)

    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      console.log('JSON parse failed in grade.ts, raw response:', jsonStr)
      throw new SyntaxError('Invalid JSON')
    }
  } catch (error: any) {
    console.error('Error grading code:', error)

    // Check for specific error types
    if (error.message?.includes('API key')) {
      return { error: 'API key is invalid or missing.' }
    }

    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON response:', error)
      return { error: 'AI response was not valid JSON. Please try again.' }
    }

    return { error: `Failed to grade code: ${error.message || 'Unknown error'}` }
  }
}
