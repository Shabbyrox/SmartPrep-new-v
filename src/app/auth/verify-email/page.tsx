'use client'

import { useSearchParams } from 'next/navigation'
import { verifySignupOTP } from '@/app/login/actions'
import { useState, Suspense } from 'react'

function VerifyForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await verifySignupOTP(formData)
        setLoading(false)
        if (res?.error) setError(res.error)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
                    <p className="mt-2 text-sm text-gray-600">Sent to <span className="font-bold">{email}</span></p>
                </div>

                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <input type="hidden" name="email" value={email} />
                    <input name="code" type="text" required className="text-slate-950 block w-full text-center tracking-[1em] text-2xl h-14 rounded-md border border-gray-300" placeholder="000000" maxLength={6} />
                    <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return <Suspense><VerifyForm /></Suspense>
}