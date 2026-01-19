// src/app/coding/loading.tsx
import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-slate-600 font-medium animate-pulse">Loading Arena...</h2>
        </div>
    )
}