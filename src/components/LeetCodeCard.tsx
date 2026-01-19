// src/components/LeetCodeCard.tsxs
'use client'

import { useState } from 'react'
import { verifySubmission } from '@/app/actions/leetcode'
import { ExternalLink, CheckCircle2, Loader2, Info, Clock, RefreshCw, AlertTriangle } from 'lucide-react'

export default function LeetCodeCard({ question, solvedAt }: any) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // ---  SMART REVISION LOGIC ---
    const getRevisionStatus = (dateString: string) => {
        if (!dateString) return null
        
        const solvedDate = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - solvedDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 3) return { label: 'Mastered', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 }
        if (diffDays <= 7) return { label: 'Review Soon', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock }
        return { label: 'Revision Due', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: AlertTriangle }
    }

    const status = getRevisionStatus(solvedAt)
    // -------------------------------

    const handleVerify = async () => {
        setLoading(true)
        setMessage('')
        
        const result = await verifySubmission(question.id, question.slug)
        
        if (result.success) {
            setMessage('✅ Verified! Status updated.')
        } else {
            setMessage(result.message)
        }
        setLoading(false)
    }

    const leetcodeUrl = `https://leetcode.com/problems/${question.slug}/`

    return (
        <div className={`p-5 rounded-xl border transition-all ${solvedAt ? 'bg-white' : 'bg-white hover:shadow-md'} border-slate-200`}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Left Side: Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900">{question.title}</h3>
                        
                        {/* Difficulty Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            question.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            question.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                            {question.difficulty}
                        </span>

                        {/*  REVISION BADGE */}
                        {status && (
                            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                                <status.icon className="w-3 h-3" />
                                {status.label}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2 mt-2 text-sm text-slate-500">
                        {question.topic_tags?.map((tag: string) => (
                            <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">#{tag}</span>
                        ))}
                    </div>
                    
                    {/* Message Box */}
                    {message && (
                        <div className={`mt-3 text-sm p-2 rounded-md ${message.includes('Verified') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-slate-600'}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Right Side: Buttons */}
                <div className="flex items-center gap-3 self-start sm:self-center">
                    {solvedAt ? (
                        <>
                            {/* If "Revision Due", show Verify button again to refresh status */}
                            {status?.label !== 'Mastered' ? (
                                <button
                                    onClick={handleVerify}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <RefreshCw className="w-4 h-4" /> Review
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium opacity-80">
                                    <CheckCircle2 className="w-5 h-5" /> Done
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <a 
                                href={leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Solve <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}