// src/app/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react' // 👈 Added Suspense and useEffect
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation' // 👈 Added useSearchParams
import { login, signup } from './actions'
import GoogleSignInButton from './google-signin-button'
import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import Footer from '@/app/page'

// Create a separate component for the form logic to handle SearchParams safely
function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()

  // 👇 Check URL for "?signup=true" when page loads
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsLogin(false) // Switch to Sign Up mode
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center px-8 py-12 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 shadow-lg border border-slate-200 rounded-xl">
          <div className="mb-8">
            <h2 className="text-3xl mb-2 text-slate-900" style={{ fontWeight: 600 }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your credentials to continue' : 'Start your career journey today'}
            </p>
          </div>

          <form className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="flex h-10 w-full rounded-md border text-slate-900 border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="flex h-10 w-full rounded-md text-slate-900 border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md text-slate-900 border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              formAction={isLogin ? login : signup}
              className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors h-11"
            >
              {isLogin ? 'Log in' : 'Create account'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleSignInButton />
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:underline hover:text-indigo-500 font-medium transition-colors"
            >
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