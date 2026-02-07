// src/app/forgot-password/page.tsx
'use client'


import { useState, useTransition } from 'react'
import { forgotPasswordAction } from './actions'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPassword() {
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(formData: FormData) {
        setError('')
        startTransition(async () => {
            const res = await forgotPasswordAction(formData)
            if (res?.error) setError(res.error)
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Reset Code"}
                    </button>
                    
                    <div className="flex justify-center">
                        <Link href="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}