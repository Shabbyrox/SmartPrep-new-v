// src/app/quiz/quiz-accordion.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Lock, CheckCircle, Play, ChevronDown, ChevronRight } from 'lucide-react'

interface Quiz {
    id: number
    role: string
    level: number
    title: string
    description: string
    passing_score: number
}

interface QuizResult {
    quiz_id: number
    score: number
    total_questions: number
}

interface QuizAccordionProps {
    quizzesByRole: Record<string, Quiz[]>
    results: QuizResult[] | null
    allQuizzes: Quiz[]
}
export default function QuizAccordion({ quizzesByRole, results, allQuizzes }: QuizAccordionProps) {
    const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set())

    // ✅ OPTIMIZATION: Create a Lookup Map for Results
    // Instead of filtering the array 100 times, we make a map once.
    // Key: quiz_id, Value: Best Score Entry
    const resultsMap = useMemo(() => {
        const map = new Map<number, QuizResult>();
        results?.forEach(r => {
            const existing = map.get(r.quiz_id);
            if (!existing || r.score > existing.score) {
                map.set(r.quiz_id, r);
            }
        });
        return map;
    }, [results]);

    const toggleRole = (role: string) => {
        const newExpanded = new Set(expandedRoles)
        if (newExpanded.has(role)) {
            newExpanded.delete(role)
        } else {
            newExpanded.add(role)
        }
        setExpandedRoles(newExpanded)
    }

    const isLocked = (quiz: Quiz) => {
        if (quiz.level === 1) return false

        // Optimization: We could also map quizzes by role+level, but array.find here is acceptable for <1000 items
        const prevLevelQuiz = allQuizzes?.find(
            (q) => q.role === quiz.role && q.level === quiz.level - 1
        )

        if (!prevLevelQuiz) return false

        // ✅ OPTIMIZATION: O(1) Lookup instead of filtering array
        const prevResult = resultsMap.get(prevLevelQuiz.id)

        if (!prevResult) return true

        const percentage = (prevResult.score / prevResult.total_questions) * 100
        return percentage < (prevLevelQuiz.passing_score || 50)
    }

    return (
        <div className="space-y-4">
            {Object.entries(quizzesByRole).map(([role, roleQuizzes]) => {
                const isExpanded = expandedRoles.has(role)

                return (
                    <div key={role} className="bg-white rounded-lg shadow overflow-hidden">
                         {/* Toggle Button Code (Same as before) */}
                         <button
                            onClick={() => toggleRole(role)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center">
                                {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-gray-500 mr-3" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-500 mr-3" />
                                )}
                                <h3 className="text-xl font-bold text-gray-900">{role}</h3>
                            </div>
                            <span className="text-sm text-gray-500">
                                {roleQuizzes.length} level{roleQuizzes.length !== 1 ? 's' : ''}
                            </span>
                        </button>

                        {isExpanded && (
                            <div className="px-6 pb-6 pt-2">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {roleQuizzes.map((quiz) => {
                                        const locked = isLocked(quiz)
                                        // ✅ OPTIMIZATION: O(1) Lookup
                                        const bestResult = resultsMap.get(quiz.id)
                                        
                                        const passed =
                                            bestResult &&
                                            (bestResult.score / bestResult.total_questions) * 100 >=
                                            (quiz.passing_score || 50)

                                        return (
                                            // ... (Card UI stays exactly the same)
                                            <div
                                                key={quiz.id}
                                                className={`bg-white overflow-hidden shadow rounded-lg border relative ${locked ? 'opacity-75 border-gray-200' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locked ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-800'} mb-2`}>
                                                                Level {quiz.level}
                                                            </span>
                                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                                {quiz.title}
                                                            </h3>
                                                        </div>
                                                        {locked ? <Lock className="text-gray-400 h-5 w-5" /> : passed ? <CheckCircle className="text-green-500 h-5 w-5" /> : null}
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                        {quiz.description}
                                                    </p>

                                                    {bestResult && (
                                                        <div className="mt-3 text-xs text-gray-500">
                                                            Best Score:{' '}
                                                            <span className="font-medium text-gray-900">
                                                                {bestResult.score}/{bestResult.total_questions}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`px-5 py-3 ${locked ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                                    {locked ? (
                                                        <span className="text-sm font-medium text-gray-400 flex items-center cursor-not-allowed">
                                                            <Lock className="mr-2 h-4 w-4" /> Locked
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            href={`/quiz/${quiz.id}`}
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                                                        >
                                                            <Play className="mr-2 h-4 w-4" />{' '}
                                                            {bestResult ? 'Retake Quiz' : 'Start Quiz'}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}