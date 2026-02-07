// src/app/quiz/page.tsx
import { createClient } from '@/utils/supabase/server'
import QuizCategoryView from './quiz-category-view'
import { redirect } from 'next/navigation'

export default async function QuizList({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
    const supabase = await createClient()
    const { role: roleFilter } = await searchParams

    // 1. Check Auth (Critical for fetching personal results)
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Fetch Quizzes (You can keep this as is or add pagination later)
    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, role, level, title, description, passing_score') // ✅ OPTIMIZATION: Select only needed columns
        .order('role')
        .order('level')

    // 3. Fetch ONLY the current user's results
    let results: any[] = []
    if (user) {
        const { data: userResults } = await supabase
            .from('quiz_results')
            .select('quiz_id, score, total_questions')
            .eq('user_id', user.id) // ✅ OPTIMIZATION: Filter by User ID
        results = userResults || []
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <QuizCategoryView 
                    allQuizzes={quizzes || []} 
                    results={results}
                    searchParams={{ role: roleFilter }}
                />
            </div>
        </div>
    )
}