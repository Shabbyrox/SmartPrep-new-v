// src/app/interview/save-result.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface InterviewResult {
    jobRole: string;
    score: number;
    conversationHistory: any;
}

export async function saveInterviewResult(result: InterviewResult) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to save interview results.' }
    }

    const { error } = await supabase.from('interview_results').insert([
        {
            user_id: user.id,
            job_role: result.jobRole,
            score: result.score,
            conversation_history: result.conversationHistory,
        },
    ])

    if (error) {
        console.error('Error saving interview result:', error)
        return { error: 'Failed to save interview result.' }
    }

    revalidatePath('/dashboard')

    return { success: true }
}
