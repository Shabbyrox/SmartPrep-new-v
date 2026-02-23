// src/app/quiz/search-bar.tsx
'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, Suspense, useRef } from 'react' // Import useRef

const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

function SearchInput() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('role')?.toString() || '')
    
    // ✅ SAFETY VALVE: Track if user is typing
    const isTyping = useRef(false)

    useEffect(() => {
        const urlRole = searchParams.get('role')?.toString() || ''
        
        // Only sync from URL if the user is NOT currently typing
        if (!isTyping.current && urlRole !== searchTerm) {
            setSearchTerm(urlRole)
        }
    }, [searchParams]) // Removed searchTerm from dependency to avoid loop

    const debouncedSearch = useMemo(
        () =>
            debounce((term: string) => {
                const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
                const params = new URLSearchParams(currentSearch)
                
                if (term) {
                    params.set('role', term)
                } else {
                    params.delete('role')
                }
                
                replace(`${pathname}?${params.toString()}`, { scroll: false })
                
                isTyping.current = false
            }, 300), // Increased to 500ms for smoother deleting
        [pathname, replace] 
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isTyping.current = true // ✅ LOCK: User is typing, ignore URL updates
        const value = e.target.value
        setSearchTerm(value) 
        debouncedSearch(value)
    }

    return (
        <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all duration-200 hover:shadow-md"
                placeholder="Search by role (e.g. Backend)..."
                value={searchTerm}
                onChange={handleChange}
            />
        </div>
    )
}

export default function QuizSearchBar() {
    return (
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-100 rounded-xl" />}>
            <SearchInput />
        </Suspense>
    )
}