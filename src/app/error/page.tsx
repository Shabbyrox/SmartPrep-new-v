// src/app/error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message') || 'Sorry, something went wrong'

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-700">{message}</p>
            <a href="/login" className="mt-4 text-indigo-600 hover:text-indigo-500">
                Back to Login
            </a>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorContent />
        </Suspense>
    )
}
