'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
            <p className="text-slate-500 mb-6">
                We couldn't load your coding arena. This is usually a temporary connection issue.
            </p>
            <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
                <RefreshCcw className="w-4 h-4" /> Try Again
            </button>
        </div>
    </div>
  )
}