// src/app/login/google-signin-button.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function GoogleSignInButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const supabase = createClient()
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                console.error('Google login error:', error)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        } finally {
            // Don't set loading to false if redirecting, but in case of error:
            // setIsLoading(false) 
            // Actually, if it redirects, the state doesn't matter. 
            // If it fails immediately, we should reset.
        }
    }

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            {isLoading ? (
                <span>Loading...</span>
            ) : (
                <>
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path
                            d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-0.65-.05-1.2833-.15-1.9h-8.3v3.6h4.75c-.2 1.0833-1.1167 3.1667-4.75 3.1667-2.8667 0-5.2-2.3333-5.2-5.2s2.3333-5.2 5.2-5.2c1.3333 0 2.5333.4667 3.4667 1.3667l2.5333-2.5333C16.4669 3.6667 14.3836 2.75 12.0003 2.75 6.8836 2.75 2.7503 6.8833 2.7503 12c0 5.1167 4.1333 9.25 9.25 9.25z"
                            fill="#4285F4"
                        />
                        <path
                            d="M2.7503 12c0-1.3667.3333-2.65.9167-3.8l2.9 2.25c-.2667.4833-.4167 1.0333-.4167 1.6s.15 1.1167.4167 1.6l-2.9 2.25c-.5834-1.15-.9167-2.4333-.9167-3.9z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12.0003 20.45c2.3833 0 4.4667-.9167 5.95-2.25l-2.85-2.25c-.7333.5-1.7333.85-3.1.85-2.3667 0-4.3667-1.6-5.0833-3.75l-2.9 2.25c1.4667 2.9167 4.4833 4.9 7.9833 4.9z"
                            fill="#34A853"
                        />
                        <path
                            d="M12.0003 2.75c2.3833 0 4.4667.9167 5.95 2.25l-2.5333 2.5333c-.9334-.9-2.1334-1.3667-3.4667-1.3667-1.3667 0-2.3667.35-3.1.85l-2.9-2.25c1.4667-2.9167 4.4833-4.9 7.9833-4.9z"
                            fill="#EA4335"
                        />
                    </svg>
                    Sign in with Google
                </>
            )}
        </button>
    )
}
