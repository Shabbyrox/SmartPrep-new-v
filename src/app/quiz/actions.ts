// src/app/quiz/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitQuiz(quizId: number, score: number, totalQuestions: number) {
    const supabase = await createClient()

    const { error } = await supabase.from('quiz_results').insert({
        quiz_id: quizId,
        score,
        total_questions: totalQuestions,
    })

    if (error) {
        console.error('Error submitting quiz:', error)
        return { error: error.message }
    }

    revalidatePath('/quiz')
}
