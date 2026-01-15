// src/app/quiz/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Lock, CheckCircle, Play, ArrowLeft } from 'lucide-react'
import QuizSearchBar from './search-bar'
import QuizAccordion from './quiz-accordion'

export default async function QuizList({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
    const supabase = await createClient()
    const { role: roleFilter } = await searchParams

    // Fetch quizzes and user results
    let query = supabase
        .from('quizzes')
        .select('*')
        .order('role')
        .order('level')

    const { data: quizzes } = await query

    const { data: results } = await supabase.from('quiz_results').select('*')

    // Group quizzes by role
    const quizzesByRole: Record<string, any[]> = {}
    quizzes?.forEach((quiz) => {
        if (!quizzesByRole[quiz.role]) {
            quizzesByRole[quiz.role] = []
        }
        quizzesByRole[quiz.role].push(quiz)
    })

    // Filter by role if param exists
    let displayQuizzes = quizzesByRole
    if (roleFilter) {
        const filtered: Record<string, any[]> = {}
        Object.keys(quizzesByRole).forEach(role => {
            if (role.toLowerCase().includes(roleFilter.toLowerCase())) {
                filtered[role] = quizzesByRole[role]
            }
        })
        // Only switch to filtered view if we actually found something
        if (Object.keys(filtered).length > 0) {
            displayQuizzes = filtered
        }
    }

    // Helper to check if a quiz is locked
    const isLocked = (quiz: any) => {
        if (quiz.level === 1) return false

        // Find the previous level quiz in the same role
        const prevLevelQuiz = quizzes?.find(
            (q) => q.role === quiz.role && q.level === quiz.level - 1
        )

        if (!prevLevelQuiz) return false // Should not happen if data is correct

        // Check if user passed previous level
        const prevResult = getBestScore(prevLevelQuiz.id)

        if (!prevResult) return true

        const percentage = (prevResult.score / prevResult.total_questions) * 100
        return percentage < (prevLevelQuiz.passing_score || 50)
    }

    // Helper to get best score
    const getBestScore = (quizId: number) => {
        const quizResults = results?.filter((r) => r.quiz_id === quizId)
        if (!quizResults || quizResults.length === 0) return null

        // Find max score
        return quizResults.reduce((max, r) => (r.score > max.score ? r : max), quizResults[0])
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    {roleFilter && (
                        <Link href="/quiz" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to all paths
                        </Link>
                    )}
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                                {roleFilter ? `Skill Path: ${roleFilter}` : 'Skill Paths'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                {roleFilter
                                    ? `Master the ${roleFilter} role by completing these levels.`
                                    : 'Master each role by completing levels sequentially.'}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4">
                            <QuizSearchBar />
                        </div>
                    </div>
                </div>

                <div>
                    {Object.keys(displayQuizzes).length > 0 ? (
                        <QuizAccordion
                            quizzesByRole={displayQuizzes}
                            results={results}
                            allQuizzes={quizzes || []}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                {roleFilter
                                    ? `No quizzes found for "${roleFilter}". Try exploring other paths.`
                                    : 'No quizzes available yet.'}
                            </p>
                            {roleFilter && (
                                <Link
                                    href="/quiz"
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    View All Paths
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
