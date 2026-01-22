// src/app/premium/page.tsx
import Link from 'next/link'
import { Crown, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import PremiumWaitlistButton from '@/components/PremiumWaitlistButton' // 👈 Import new component

export default async function PremiumPage() {
    // 1. Check DB on the server
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let hasJoined = false

    if (user) {
        const { data } = await supabase
            .from('premium_waitlist')
            .select('user_id')
            .eq('user_id', user.id)
            .single()
        
        if (data) hasJoined = true
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                
                {/* Icon Wrapper */}
                <div className="group mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 transition-all duration-500 hover:rotate-12 hover:scale-110 cursor-pointer">
                    <Crown className="h-12 w-12 text-indigo-600 transition-transform duration-500 group-hover:scale-110" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Premium is Coming!
                </h1>
                
                <p className="text-gray-600 mb-8">
                    We are crafting exclusive features to help you accelerate your career. 
                </p>

                <div className="space-y-3">
                    
                    {/* 👇 Pass the DB status to the Client Component */}
                    <PremiumWaitlistButton initialHasJoined={hasJoined} />

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