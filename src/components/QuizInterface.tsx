// src/components/QuizInterface.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { submitQuiz } from '@/app/quiz/actions'
import { gradeCode } from '@/app/quiz/grade'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
// 👈 NEW: Imported Flame for the combo visual
import { CheckCircle, XCircle, ArrowLeft, Clock, Flame } from 'lucide-react' 

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
    role: string 
    questions: Question[]
}

interface AnswerRecord {
    question: string
    userAnswer: string
    correctAnswer?: string
    isCorrect: boolean
    type: 'mcq' | 'code_challenge'
    feedback?: string
}

export default function QuizInterface({ quiz }: { quiz: Quiz }) {
    const router = useRouter()
    
    // --- CORE QUIZ STATES ---
    const [hasStarted, setHasStarted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([])
    
    // 👈 NEW: STREAK STATE
    const [streak, setStreak] = useState(0)
    
    // --- INTERACTION STATES ---
    const [code, setCode] = useState('')
    const [grading, setGrading] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false) 
    
    // --- TIMER STATES ---
    const [endTime, setEndTime] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    
    const storageKey = `intraa_quiz_progress_${quiz.id}`
    const question = quiz.questions[currentQuestion]

    // 🛡️ ANTI-BUG MEASURE
    const stateRef = useRef({ currentQuestion, score, answerHistory, showResults, streak })
    useEffect(() => {
        stateRef.current = { currentQuestion, score, answerHistory, showResults, streak }
    }, [currentQuestion, score, answerHistory, showResults, streak])

    // 1️⃣ LOAD PROGRESS ON MOUNT
    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey)
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress)
                if (parsed.currentQuestion < quiz.questions.length && !parsed.showResults) {
                    setHasStarted(parsed.hasStarted || false)
                    setCurrentQuestion(parsed.currentQuestion)
                    setScore(parsed.score)
                    setStreak(parsed.streak || 0) // Load the streak
                    setAnswerHistory(parsed.answerHistory || [])
                    setEndTime(parsed.endTime || null)
                } else {
                    localStorage.removeItem(storageKey)
                }
            } catch (e) {
                console.error("Failed to parse saved quiz progress")
                localStorage.removeItem(storageKey)
            }
        }
        setIsLoaded(true)
    }, [quiz.id, quiz.questions.length, storageKey])

    // 2️⃣ SAVE PROGRESS EVERY TIME STATE CHANGES
    useEffect(() => {
        if (!isLoaded || showResults) return; 
        
        const progressData = {
            hasStarted,
            currentQuestion,
            score,
            streak, // Save the streak
            answerHistory,
            endTime
        }
        localStorage.setItem(storageKey, JSON.stringify(progressData))
    }, [hasStarted, currentQuestion, score, streak, answerHistory, endTime, isLoaded, showResults, storageKey])


    // 3️⃣ THE MASTER TIMER LOGIC
    const handleTimeUp = useCallback(() => {
        const { currentQuestion, score, answerHistory, showResults } = stateRef.current
        if (showResults) return; 
        
        const remainingHistory = [];
        for (let i = currentQuestion; i < quiz.questions.length; i++) {
            remainingHistory.push({
                question: quiz.questions[i].question,
                userAnswer: 'Skipped (Time Up)',
                correctAnswer: quiz.questions[i].answer,
                isCorrect: false,
                type: quiz.questions[i].type || 'mcq',
                feedback: 'You ran out of time before answering this question.'
            });
        }

        const finalHistory = [...answerHistory, ...remainingHistory]
        setAnswerHistory(finalHistory)
        setShowResults(true)
        submitQuiz(quiz.id, score, quiz.questions.length)
        localStorage.removeItem(storageKey)
    }, [quiz.questions, quiz.id, storageKey])

    useEffect(() => {
        if (!hasStarted || !endTime || showResults) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleTimeUp();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [hasStarted, endTime, showResults, handleTimeUp]);


    // --- QUIZ LOGIC ---
    useEffect(() => {
        if (!question) return;
        
        if (question.type === 'code_challenge') {
            setCode(question.starter_code || '')
        } else {
            setCode('')
        }
        setSelectedOption(null)
        setFeedback(null)
        setIsTransitioning(false)
    }, [currentQuestion, question])

    const handleNext = (isCorrect: boolean, userAnswer: string = 'Skipped', additionalFeedback?: string) => {
        if (stateRef.current.showResults) return;

        const newScore = score + (isCorrect ? 1 : 0)
        setScore(newScore)
        
        // 👈 NEW: Update Streak Logic
        if (isCorrect) {
            setStreak(prev => prev + 1)
        } else {
            setStreak(0) // Reset streak if they get it wrong or skip
        }

        const newHistory = [...answerHistory, {
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: isCorrect,
            type: question.type || 'mcq',
            feedback: additionalFeedback
        }]
        
        setAnswerHistory(newHistory)
        
        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            localStorage.removeItem(storageKey)
            setShowResults(true)
            submitQuiz(quiz.id, newScore, quiz.questions.length)
        }
    }

   const handleMCQAnswer = (option: string) => {
        if (isTransitioning) return; 
        
        setIsTransitioning(true);
        setSelectedOption(option); 
        
        // 👈 NEW: Increased delay to 1.5 seconds so they can see the color reveal!
        setTimeout(() => {
            const isCorrect = option === question.answer
            handleNext(isCorrect, option)
        }, 1500); 
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
            setIsTransitioning(true) 
            setTimeout(() => handleNext(true, code, 'Correct! Great job.'), 1500)
        } else {
            setFeedback(`Incorrect. ${result.feedback}`)
            setStreak(0) // 👈 NEW: Break the streak if their code fails!
        }
    }

    const handleExitQuiz = () => {
        if (window.confirm("Are you sure you want to exit? Your current progress will be cleared.")) {
            localStorage.removeItem(storageKey)
            router.push(`/quiz?role=${encodeURIComponent(quiz.role)}`)
        }
    }

    const startQuiz = (minutes: number | null) => {
        setHasStarted(true);
        if (minutes) {
            const newEndTime = Date.now() + minutes * 60 * 1000;
            setEndTime(newEndTime);
            setTimeLeft(minutes * 60);
        } else {
            setEndTime(null);
            setTimeLeft(null);
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };


    // --- RENDER STATES ---

    if (!isLoaded || (!question && hasStarted && !showResults)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-indigo-600 font-medium text-lg">Loading your quiz...</div>
            </div>
        )
    }

    if (!hasStarted) {
        return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-indigo-600 px-6 py-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white">{quiz.title}</h2>
                        <p className="mt-2 text-indigo-100 font-medium">{quiz.questions.length} Questions</p>
                    </div>
                    <div className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Select Time Limit</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[5, 10, 20].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => startQuiz(mins)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 font-semibold transition-all"
                                >
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    {mins} Min
                                </button>
                            ))}
                            <button
                                onClick={() => startQuiz(null)}
                                className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 font-semibold transition-all"
                            >
                                No Limit
                            </button>
                        </div>
                        <button
                            onClick={handleExitQuiz}
                            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            Cancel and go back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white p-8 shadow rounded-lg text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
                        <p className="text-xl text-gray-700 mb-6">
                            You scored <span className="font-bold text-indigo-600 text-2xl">{score}</span> out of{' '}
                            <span className="font-bold text-2xl">{quiz.questions.length}</span>
                        </p>
                        <button
                            onClick={() => router.push(`/quiz?role=${encodeURIComponent(quiz.role)}`)}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                            Back to {quiz.role} Path
                        </button>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Review Your Answers</h3>
                        <div className="space-y-6">
                            {answerHistory.map((record, index) => (
                                <div 
                                    key={index} 
                                    className={`p-5 border-2 rounded-xl transition-all ${
                                        record.isCorrect ? 'bg-green-50/50 border-green-200' : 
                                        record.userAnswer.includes('Time Up') ? 'bg-orange-50/50 border-orange-200' : 'bg-red-50/50 border-red-200'
                                    }`}
                                >
                                    <div className="flex gap-4 mb-4">
                                        {record.isCorrect ? (
                                            <CheckCircle className="text-green-500 h-6 w-6 shrink-0 mt-1" />
                                        ) : record.userAnswer.includes('Time Up') ? (
                                             <Clock className="text-orange-500 h-6 w-6 shrink-0 mt-1" />
                                        ) : (
                                            <XCircle className="text-red-500 h-6 w-6 shrink-0 mt-1" />
                                        )}
                                        <div className="prose prose-sm max-w-none text-gray-900">
                                            <p className="font-bold text-gray-700 mb-1">Question {index + 1}:</p>
                                            <ReactMarkdown>{record.question}</ReactMarkdown>
                                        </div>
                                    </div>
                                    
                                    <div className="ml-10 space-y-3 text-sm">
                                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                            <span className="font-semibold text-gray-700 block mb-1">Your Answer:</span>
                                            {record.type === 'code_challenge' && !record.userAnswer.includes('Time Up') ? (
                                                <pre className="mt-2 p-3 bg-slate-900 text-slate-50 rounded-md overflow-x-auto text-xs">
                                                    <code>{record.userAnswer}</code>
                                                </pre>
                                            ) : (
                                                <p className={`mt-1 font-medium ${record.isCorrect ? 'text-green-700' : record.userAnswer.includes('Time Up') ? 'text-orange-700 italic' : 'text-red-700'}`}>
                                                    {record.userAnswer}
                                                </p>
                                            )}
                                        </div>

                                        {!record.isCorrect && (
                                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
                                                <span className="font-semibold text-indigo-900 block mb-1">
                                                    {record.type === 'code_challenge' ? 'AI Feedback:' : 'Correct Answer:'}
                                                </span>
                                                {record.type === 'code_challenge' ? (
                                                    <p className="mt-1 text-indigo-800">{record.feedback}</p>
                                                ) : (
                                                    <p className="mt-1 text-green-700 font-bold">{record.correctAnswer}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={handleExitQuiz}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Exit to {quiz.role}
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {/* 👈 NEW: COMBO ANIMATION UI */}
                        {streak >= 3 && (
                            <div className="animate-bounce flex items-center bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                                <Flame className="w-4 h-4 text-orange-600 mr-1" />
                                <span className="text-orange-700 font-bold text-sm">{streak}x Combo!</span>
                            </div>
                        )}
                        
                        {timeLeft !== null && (
                            <div className={`inline-flex items-center px-4 py-2 rounded-full font-mono text-lg font-bold shadow-sm transition-colors ${
                                timeLeft <= 60 ? 'bg-red-100 text-red-700 animate-pulse border border-red-200' : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                                <Clock className={`w-5 h-5 mr-2 ${timeLeft <= 60 ? 'text-red-600' : 'text-indigo-500'}`} />
                                {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
                            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                Question {currentQuestion + 1} of {quiz.questions.length}
                            </span>
                        </div>
                        
                        {/* 👈 UPDATED: Progress Bar turns Orange/Red if you are on a hot streak! */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ease-out ${streak >= 3 ? 'bg-orange-500' : 'bg-indigo-600'}`}
                                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                        
                        <div className="prose max-w-none text-gray-900 text-lg">
                            <ReactMarkdown>{question.question}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50">
                        {question.type === 'code_challenge' ? (
                            <div className="space-y-4">
                                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
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
                                            padding: { top: 16 }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className={`text-sm font-medium ${feedback?.startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                                        {grading ? (
                                            <span className="text-indigo-600 flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Analyzing your code via AI...
                                            </span>
                                        ) : feedback}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                if (isTransitioning) return;
                                                setIsTransitioning(true);
                                                handleNext(false, code || 'Skipped', feedback || 'You skipped this question.')
                                            }}
                                            disabled={grading || isTransitioning}
                                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={handleCodeSubmit}
                                            disabled={grading || isTransitioning}
                                            className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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
                                        disabled={isTransitioning}
                                        // 👈 NEW: This handles the immediate visual feedback (Green/Red) upon clicking!
                                        className={`w-full text-left px-5 py-4 border-2 rounded-xl shadow-sm transition-all text-gray-900 relative overflow-hidden
                                            ${isTransitioning
                                                ? option === question.answer
                                                    ? 'bg-green-50 border-green-500 ring-2 ring-green-500 scale-[0.99]' // Correct answer reveals green
                                                    : option === selectedOption
                                                        ? 'bg-red-50 border-red-500 ring-2 ring-red-500 scale-[0.99]' // Picked wrong answer turns red
                                                        : 'bg-gray-50 border-gray-200 opacity-50' // Unselected wrong answers fade out
                                                : selectedOption === option // Only hits for a split second before transition lock engages
                                                    ? 'bg-indigo-50 border-indigo-500 scale-[0.99]'
                                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className="prose-sm max-w-none pointer-events-none text-base">
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