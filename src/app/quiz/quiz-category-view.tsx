// src/app/quiz/quiz-category-view.tsx
'use client'

import { useState, useMemo } from 'react'
import { Briefcase, Code2, Layers, Users, TrendingUp, DollarSign } from 'lucide-react'
import QuizAccordion from './quiz-accordion'
import QuizSearchBar from './search-bar'

// 1. Define your Categories and which Roles belong to them
const ROLE_CATEGORIES: Record<string, string[]> = {
    'Engineering': ['Backend Developer',  'Cybersecurity Analyst', 'Frontend Developer','Data Engineer', 'DevOps Engineer',
                         'Data Scientist', 'General Aptitude','JavaScript Developer', 'Mobile App Developer','Software Engineer'],
    'Management': ['Human Resources','Marketing', 'Finance', 'Operations', 'Business Analytics', 'Product Management']
}

interface QuizCategoryViewProps {
    allQuizzes: any[]
    results: any[]
    searchParams?: { role?: string }
}

export default function QuizCategoryView({ allQuizzes, results, searchParams }: QuizCategoryViewProps) {
    // Default to Engineering if no search param, otherwise find the category of the searched role
    const [activeCategory, setActiveCategory] = useState<'Engineering' | 'Management'>('Engineering')

    // 2. Filter Quizzes based on Active Category
    const filteredQuizzes = useMemo(() => {
        const allowedRoles = ROLE_CATEGORIES[activeCategory] || []
        
        // Filter quizzes that belong to the current category
        return allQuizzes.filter(quiz => 
            allowedRoles.some(role => 
                quiz.role.toLowerCase() === role.toLowerCase()
            )
        )
    }, [activeCategory, allQuizzes])

    // 3. Group the filtered quizzes by Role (Logic moved from page.tsx)
    const quizzesByRole = useMemo(() => {
        const grouped: Record<string, any[]> = {}
        
        filteredQuizzes.forEach((quiz) => {
            // Capitalize first letter for display consistency
            const normalizedRole = quiz.role.charAt(0).toUpperCase() + quiz.role.slice(1)
            
            if (!grouped[normalizedRole]) {
                grouped[normalizedRole] = []
            }
            grouped[normalizedRole].push(quiz)
        })
        
        // If user searched for a specific role, filter the groups
        if (searchParams?.role) {
            const search = searchParams.role.toLowerCase()
            const searchedGroup: Record<string, any[]> = {}
            Object.keys(grouped).forEach(role => {
                if (role.toLowerCase().includes(search)) {
                    searchedGroup[role] = grouped[role]
                }
            })
            return searchedGroup
        }

        return grouped
    }, [filteredQuizzes, searchParams])

    return (
        <div>
            {/* Header Section */}
            <div className="mb-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                            Skill Paths
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Select a domain to explore career paths and skill assessments.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                        <QuizSearchBar />
                    </div>
                </div>

                {/* DOMAIN TABS */}
                <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveCategory('Engineering')}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                ${activeCategory === 'Engineering'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <Code2 className={`
                                -ml-0.5 mr-2 h-5 w-5
                                ${activeCategory === 'Engineering' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                            `} />
                            Engineering
                        </button>

                        <button
                            onClick={() => setActiveCategory('Management')}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                ${activeCategory === 'Management'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <Briefcase className={`
                                -ml-0.5 mr-2 h-5 w-5
                                ${activeCategory === 'Management' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                            `} />
                            Management
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content Section */}
            <div>
                {Object.keys(quizzesByRole).length > 0 ? (
                    <QuizAccordion
                        quizzesByRole={quizzesByRole}
                        results={results}
                        allQuizzes={allQuizzes}
                    />
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <Layers className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            We haven't added quizzes for {activeCategory} yet, or your search didn't match anything.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}