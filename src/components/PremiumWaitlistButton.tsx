// src/components/PremiumWaitlistButton.tsx
'use client'

import { useState } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'
import { joinWaitlist } from '@/app/actions/premium'

export default function PremiumWaitlistButton({ initialHasJoined }: { initialHasJoined: boolean }) {
    // If server says they joined, start as 'success', otherwise 'idle'
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>(
        initialHasJoined ? 'success' : 'idle'
    )

    const handleJoin = async () => {
        setStatus('loading')
        await joinWaitlist()
        setStatus('success')
    }

    return (
        <button
            onClick={handleJoin}
            disabled={status !== 'idle'} // Disable if loading OR success
            className={`w-full flex items-center justify-center px-4 py-3 border text-sm font-medium rounded-xl shadow-sm transition-all duration-200 ${
                status === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-default opacity-100' 
                    : 'bg-white text-indigo-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
            }`}
        >
            {status === 'loading' ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                </>
            ) : status === 'success' ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    You're on the list! 💌
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4 mr-2" />
                    Notify me when it's ready
                </>
            )}
        </button>
    )
}