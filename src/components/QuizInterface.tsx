'use client'

import { useState, useEffect } from 'react'
import { submitQuiz } from '@/app/quiz/actions'
import { gradeCode } from '@/app/quiz/grade'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'

interface Question {
    type?: 'mcq' | 'code_challenge'
    question: string
    options?: string[]
    answer?: string
    starter_code?: string
    test_case_description?: string
}

interface Quiz {
    id: number
    title: string
    questions: Question[]
}

export default function QuizInterface({ quiz }: { quiz: Quiz }) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [code, setCode] = useState('')
    const [grading, setGrading] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const router = useRouter()

    const question = quiz.questions[currentQuestion]

    // ✅ FIX 1: Use useEffect to reset state when question changes
    // This prevents the "Too many re-renders" crash
    useEffect(() => {
        if (question.type === 'code_challenge') {
            setCode(question.starter_code || '')
        } else {
            setCode('')
        }
        setSelectedOption(null)
        setFeedback(null)
    }, [currentQuestion, question])

    const handleNext = (points: number) => {
        const newScore = score + points
        setScore(newScore)
        
        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            setShowResults(true)
            submitQuiz(quiz.id, newScore, quiz.questions.length)
        }
    }

   const handleMCQAnswer = (option: string) => {
    setSelectedOption(option); // Set visual state immediately
    
    // Optional: Add a small delay so they see what they clicked before moving on
    setTimeout(() => {
        const isCorrect = option === question.answer
        handleNext(isCorrect ? 1 : 0)
    }, 300); // 300ms delay for better UX
}

    const handleCodeSubmit = async () => {
        setGrading(true)
        setFeedback(null)

        const result = await gradeCode(question.question, code)

        setGrading(false)

        if (result.error) {
            setFeedback(`Error: ${result.error}`)
            return
        }

        if (result.correct) {
            setFeedback('Correct! Great job.')
            setTimeout(() => handleNext(1), 1500)
        } else {
            setFeedback(`Incorrect. ${result.feedback}`)
        }
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="bg-white p-8 shadow rounded-lg text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
                    <p className="text-lg text-gray-700 mb-6">
                        You scored <span className="font-bold text-indigo-600">{score}</span> out of{' '}
                        <span className="font-bold">{quiz.questions.length}</span>
                    </p>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
                            <span className="text-sm text-gray-500">
                                Question {currentQuestion + 1} of {quiz.questions.length}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                        <div className="prose text-gray-900">
                            <ReactMarkdown>{question.question}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50">
                        {question.type === 'code_challenge' ? (
                            <div className="space-y-4">
                                <div className="border rounded-md overflow-hidden">
                                    <Editor
                                        height="300px"
                                        defaultLanguage="javascript"
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            scrollBeyondLastLine: false,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className={`text-sm ${feedback?.startsWith('Correct') ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                                        {grading ? 'Analyzing your code...' : feedback}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleNext(0)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={handleCodeSubmit}
                                            disabled={grading}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {grading ? 'Checking...' : 'Submit Code'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {question.options?.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleMCQAnswer(option)}
                                        // ✅ FIX: dynamic class based on 'selectedOption'
                                        className={`w-full text-left px-4 py-3 border rounded-md shadow-sm transition-colors text-gray-900
                                            ${selectedOption === option 
                                                ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500' // Highlight selected
                                                : 'bg-white border-gray-300 hover:bg-indigo-50' // Normal state
                                            }
                                        `}
                                    >
                                        <div className="prose-sm">
                                            <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                                                {option}
                                            </ReactMarkdown>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}