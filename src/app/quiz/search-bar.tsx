// src/app/quiz/search-bar.tsx
'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export default function QuizSearchBar() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('role')?.toString() || '')

    // Debounce function
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout
        return (...args: any[]) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func(...args), wait)
        }
    }

    const handleSearch = useCallback(
        debounce((term: string) => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('role', term)
            } else {
                params.delete('role')
            }
            replace(`${pathname}?${params.toString()}`)
        }, 300),
        [searchParams, pathname, replace]
    )

    return (
        <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all duration-200 ease-in-out hover:shadow-md"
                placeholder="Search by role (e.g. Backend)..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleSearch(e.target.value)
                }}
            />
        </div>
    )
}
