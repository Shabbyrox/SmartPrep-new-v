// src/app/interview/page.tsx
'use client'

import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function InterviewPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                
                {/* Icon Wrapper */}
                <div className="mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="h-12 w-12 text-indigo-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Coming Soon!
                </h1>
                
                <p className="text-gray-600 mb-8">
                    We are putting the finishing touches on our <b>AI Interviewer</b>. 
                    Get ready to practice with real-time feedback very soon!
                </p>

                <div className="space-y-4">
                    {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-slate-900">What to expect:</p>
                        <ul className="text-sm text-slate-500 mt-2 space-y-1">
                            <li>🎤 Real-time voice analysis</li>
                            <li>🤖 AI-generated follow-up questions</li>
                            <li>📊 Detailed confidence reports</li>
                        </ul>
                    </div> */}

                    <Link 
                        href="/dashboard"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>

            </div>
        </div>
    )
}