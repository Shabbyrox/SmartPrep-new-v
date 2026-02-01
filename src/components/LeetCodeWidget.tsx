'use client'

import { useState } from 'react'
import { updateLeetCodeUsername } from '@/app/actions/profile'
import { CheckCircle2, Loader2, Edit2, Save, X, Globe, AlertCircle } from 'lucide-react'

export default function LeetCodeWidget({ initialUsername }: { initialUsername?: string | null }) {
    const [isEditing, setIsEditing] = useState(!initialUsername)
    const [username, setUsername] = useState(initialUsername || '')
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleSubmit = async () => {
        if (!username.trim()) return
        setLoading(true)
        setStatusMessage(null)
        
        const result = await updateLeetCodeUsername(username)
        setLoading(false)

        if (result.success) {
            setIsEditing(false)
            setStatusMessage(null)
        } else {
            setStatusMessage({ text: result.message, type: 'error' })
        }
    }

    return (
        // 1. Removed 'h-full'. This prevents the stretching.
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">LeetCode Profile</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                        {isEditing ? 'Not Connected' : 'Connected'}
                    </p>
                </div>
            </div>

            {/* Content - No longer pushed to bottom with mt-auto */}
            <div className="space-y-3">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex-1 min-w-0 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            />
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                            {initialUsername && (
                                <button 
                                    onClick={() => {
                                        setIsEditing(false)
                                        setStatusMessage(null)
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        {statusMessage?.type === 'error' && (
                            <div className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {statusMessage.text}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 text-green-700 overflow-hidden">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span className="font-semibold text-xs truncate">@{username}</span>
                        </div>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-slate-600 hover:text-indigo-600 transition-colors ml-2"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}