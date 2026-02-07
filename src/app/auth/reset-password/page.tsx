// src/app/auth/reset-password/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { resetPasswordAction } from '@/app/forgot-password/actions'
import { useState, Suspense, useTransition } from 'react'
import { Loader2, KeyRound } from 'lucide-react'

function ResetForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const res = await resetPasswordAction(formData)
            if (res?.error) setError(res.error)
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg border border-gray-100 space-y-6">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter the code sent to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}
                
                <form action={handleSubmit} className="space-y-5">
                    <input type="hidden" name="email" value={email} />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input 
                            name="code" 
                            required 
                            autoComplete="off"
                            className="block w-full text-slate-950 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 border tracking-widest text-center font-mono text-lg" 
                            placeholder="000000" 
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                            name="password" 
                            type="password" 
                            required 
                            className="block w-full text-slate-950 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 border" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                            name="confirmPassword" 
                            type="password" 
                            required 
                            className="block w-full text-slate-950 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 border" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Updating Password...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function ResetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <ResetForm />
        </Suspense>
    )
}