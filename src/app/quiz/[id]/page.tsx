// src/app/quiz/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import QuizInterface from '@/components/QuizInterface'

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: quiz, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !quiz) {
        redirect('/quiz')
    }

    return <QuizInterface quiz={quiz} />
}
