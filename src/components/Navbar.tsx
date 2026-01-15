// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions'
import { Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false) // 👈 Fix for hydration mismatch

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // 1. Wait for client to mount (prevents "flicker" of wrong navbar)
    if (!isMounted) return null

    // 2. Safe Check: Handle null pathnames and trailing slashes
    // This ensures "/" matches even if Next.js returns null or empty string momentarily
    const currentPath = pathname || '/'
    const hiddenRoutes = ['/', '/login', '/auth/callback', '/forgot-password']

    if (hiddenRoutes.includes(currentPath)) {
        return null
    }

    const isActive = (path: string) => {
        return currentPath === path 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/quiz', label: 'Quizzes' },
        { href: '/resume', label: 'Resume' },
        { href: '/interview', label: 'Interview' },
        { href: '/premium', label: 'Premium' },
        { href: '/profile', label: 'Profile' },
    ]

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            {/* ... (Rest of your JSX is fine) ... */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    
                    {/* Left Side */}
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-900 tracking-tight">
                                    Intraa
                                </span>
                            </Link>
                        </div>
                        
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-2 sm:items-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href)}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center">
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </form>
                        </div>

                        {/* Mobile Button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                            >
                                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-slate-200 bg-white">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-3 py-2 text-base font-medium ${isActive(link.href)}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}