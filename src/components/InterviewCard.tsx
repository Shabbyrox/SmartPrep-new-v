// src/components/InterviewCard.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Play, Send, Loader2, AlertCircle } from 'lucide-react'
import { generateInterviewQuestion } from '@/app/interview/generate-interview-question'
import { evaluateAnswer } from '@/app/interview/evaluate-answer'
import { saveInterviewResult } from '@/app/interview/save-result'
import { transcribeAudio } from '@/app/interview/transcribe' 

interface ConversationTurn {
    question: string
    answer: string
    score?: number
    feedback?: string
}

const JOB_ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UI/UX Designer'
]

const MAX_QUESTIONS = 5

export default function InterviewCard() {
    const [jobRole, setJobRole] = useState('')
    const [interviewStarted, setInterviewStarted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState('')
    
    // Recording States
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessingAudio, setIsProcessingAudio] = useState(false)
    const [transcript, setTranscript] = useState('')
    
    const [isLoading, setIsLoading] = useState(false)
    const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])
    const [questionNumber, setQuestionNumber] = useState(1)
    const [interviewComplete, setInterviewComplete] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Refs for MediaRecorder
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const synthRef = useRef<SpeechSynthesis | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis
        }
        return () => {
            stopRecording()
            if (synthRef.current) synthRef.current.cancel()
        }
    }, [])

    // --- 1. NEW: Universal Recording Logic ---
    const mimeTypeRef = useRef<string>('audio/webm')

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            
            // 1. Detect the best supported MIME type for this browser
            let mimeType = 'audio/webm'; // Default for Chrome
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4'; // Safari (iOS/Mac)
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                mimeType = 'audio/ogg'; // Firefox
            }
            
            mimeTypeRef.current = mimeType; // Save it for later

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Could not access microphone. Please check permissions.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setIsProcessingAudio(true)

            mediaRecorderRef.current.onstop = async () => {
                // Use the detected mimeType
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current })
                const reader = new FileReader()
                
                reader.readAsDataURL(audioBlob)
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string
                    
                    // 2. Send both audio AND mimeType to the server
                    const result = await transcribeAudio(base64Audio, mimeTypeRef.current)
                    
                    setIsProcessingAudio(false)
                    if (result.text) {
                        setTranscript(prev => prev + (prev ? ' ' : '') + result.text)
                    } else {
                        // Silent failure is better than an alert loop, 
                        // sometimes it just means silence was recorded.
                        console.log('No speech detected in audio.')
                    }
                }
            }
            
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording()
        } else {
            setTranscript('') // Clear previous text when starting new recording
            startRecording()
        }
    }

    // --- 2. Standard Logic (Same as before) ---
    const startInterview = async () => {
        if (!jobRole) return
        setIsLoading(true)
        setInterviewStarted(true)

        const result = await generateInterviewQuestion(jobRole, [], 1)
        if (result.error) {
            alert(result.error)
            setIsLoading(false)
            return
        }

        setCurrentQuestion(result.question!)
        speakText(result.question!)
        setIsLoading(false)
    }

    const speakText = (text: string) => {
        if (synthRef.current) {
            synthRef.current.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            synthRef.current.speak(utterance)
        }
    }

    const submitAnswer = async () => {
        if (!transcript.trim()) return

        setIsLoading(true)
        if (isRecording) stopRecording()

        const evaluation = await evaluateAnswer(currentQuestion, transcript, jobRole)

        const newTurn: ConversationTurn = {
            question: currentQuestion,
            answer: transcript,
            score: evaluation.score,
            feedback: evaluation.feedback
        }

        const updatedHistory = [...conversationHistory, newTurn]
        setConversationHistory(updatedHistory)

        if (questionNumber >= MAX_QUESTIONS) {
            setInterviewComplete(true)
            setIsLoading(false)
            return
        }

        const nextQuestionNum = questionNumber + 1
        const nextQuestion = await generateInterviewQuestion(jobRole, updatedHistory, nextQuestionNum)

        if (nextQuestion.error) {
            alert(nextQuestion.error)
            setIsLoading(false)
            return
        }

        setQuestionNumber(nextQuestionNum)
        setCurrentQuestion(nextQuestion.question!)
        setTranscript('')
        speakText(nextQuestion.question!)
        setIsLoading(false)
    }

    const restartInterview = () => {
        setJobRole('')
        setInterviewStarted(false)
        setCurrentQuestion('')
        setTranscript('')
        setConversationHistory([])
        setQuestionNumber(1)
        setInterviewComplete(false)
        if (synthRef.current) synthRef.current.cancel()
    }

    const getAverageScore = () => {
        if (conversationHistory.length === 0) return 0
        const total = conversationHistory.reduce((sum, turn) => sum + (turn.score || 0), 0)
        return Math.round(total / conversationHistory.length)
    }

    useEffect(() => {
        if (interviewComplete && jobRole && conversationHistory.length > 0) {
            const resultToSave = {
                jobRole,
                score: getAverageScore(),
                conversationHistory,
            };
            saveInterviewResult(resultToSave).catch(console.error)
        }
    }, [interviewComplete, jobRole, conversationHistory])

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
            <div className="p-6">
                {!interviewStarted && !interviewComplete && (
                    <>
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                                <Mic className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900">AI Voice Interview</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Practice with AI. Works in all modern browsers.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job Role</label>
                                <select
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="block text-gray-900 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                >
                                    <option value="">-- Select a role --</option>
                                    {JOB_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={startInterview}
                                disabled={!jobRole || isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all ${!jobRole || isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}
                            >
                                {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Preparing...</> : 'Start Interview'}
                            </button>
                        </div>
                    </>
                )}

                {interviewStarted && !interviewComplete && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{jobRole} Interview</h4>
                                <p className="text-sm text-gray-500">Question {questionNumber} of {MAX_QUESTIONS}</p>
                            </div>
                            {isSpeaking && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 animate-pulse">
                                    <Play className="h-3 w-3 mr-1" /> AI Speaking...
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Current Question</p>
                            <p className="text-lg text-slate-900 leading-relaxed font-medium">{currentQuestion}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Your Answer:</label>
                                <button
                                    onClick={toggleRecording}
                                    disabled={isProcessingAudio}
                                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        isRecording
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                            : isProcessingAudio
                                                ? 'bg-slate-100 text-slate-500 cursor-wait'
                                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                    }`}
                                >
                                    {isProcessingAudio ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing Audio...
                                        </>
                                    ) : isRecording ? (
                                        <>
                                            <MicOff className="h-4 w-4 mr-2" />
                                            Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="h-4 w-4 mr-2" />
                                            Start Recording
                                        </>
                                    )}
                                </button>
                            </div>

                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                rows={5}
                                className="block w-full rounded-lg text-gray-900 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border placeholder:text-gray-400"
                                placeholder={isRecording ? 'Recording... Speak clearly.' : 'Your answer will appear here. You can also type manually.'}
                            />

                            <button
                                onClick={submitAnswer}
                                disabled={!transcript.trim() || isLoading || isRecording}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all ${!transcript.trim() || isLoading || isRecording ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}
                            >
                                {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Analyzing...</> : <><Send className="h-4 w-4 mr-2" /> Submit Answer</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Results Section (Same as before) --- */}
                {interviewComplete && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900">Interview Complete!</h4>
                            <p className="text-gray-500 mt-2">Here is how you performed</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg">
                            <p className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-sm">Overall Score</p>
                            <div className="text-6xl font-extrabold mb-2">{getAverageScore()}<span className="text-3xl opacity-70">/10</span></div>
                        </div>
                        <div className="space-y-4">
                            <h5 className="font-bold text-gray-900">Interview Transcript</h5>
                            {conversationHistory.map((turn, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900 mb-2">Q{idx + 1}: {turn.question}</p>
                                    <div className="bg-slate-50 p-3 rounded-lg mb-3"><p className="text-sm text-slate-700 italic">"{turn.answer}"</p></div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(turn.score || 0) >= 7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>Score: {turn.score}/10</span>
                                        <p className="text-xs text-slate-500 max-w-[70%] text-right">{turn.feedback}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={restartInterview} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">Start New Interview</button>
                    </div>
                )}
            </div>
        </div>
    )
}