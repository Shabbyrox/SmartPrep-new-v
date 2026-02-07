// src/app/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import GoogleSignInButton from './google-signin-button'
import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import Link from 'next/link'

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('signup') === 'true') setIsLogin(false)
    if (searchParams.get('verified') === 'true') {
        setSuccess('Account verified! Please log in.')
        setIsLogin(true)
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    const action = isLogin ? login : signup
    const result = await action(formData)
    
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="flex items-center justify-center px-8 py-12 bg-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white p-8 shadow-lg border border-slate-200 rounded-xl">
          <div className="mb-8">
            <h2 className="text-3xl mb-2 text-slate-900 font-semibold">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
          </div>

          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
          {success && <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">{success}</div>}

          <form action={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input name="name" required placeholder="John Doe" className="w-full h-10 text-slate-600 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input name="email" type="email" required placeholder="you@example.com" className="text-slate-600 w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••" 
                className="text-slate-600 w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
              
              {/* 👇 Link moved BELOW the field and aligned LEFT */}
              {isLogin && (
                <div className="mt-1 text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>



            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input name="confirmPassword" type="password" required placeholder="••••••••" className="text-slate-600 w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full h-11 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70">
              {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Create account')}
            </button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or continue with</span></div>
            </div>
            <GoogleSignInButton />
          </form>

          <div className="mt-6 text-center text-sm">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 hover:underline font-medium">
              {isLogin ? "Don't have an account? Create one" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col bg-white">
      <LandingHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Wrap form in Suspense to prevent build errors with useSearchParams */}
        <Suspense fallback={<div className="bg-white" />}>
          <LoginForm />
        </Suspense>

        {/* Right Panel */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-white max-w-lg"
          >
            <blockquote className="text-3xl mb-6" style={{ fontWeight: 600, lineHeight: 1.4 }}>
              "Careers are built with preparation, not luck."
            </blockquote>
            <p className="text-lg opacity-90 font-light">
              Join thousands preparing smarter for their dream careers.
            </p>
          </motion.div>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}