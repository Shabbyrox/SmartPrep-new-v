'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ListTodo, Search, X, CheckCircle2, Lock } from 'lucide-react'

// Quick Filters
const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Google', value: 'google' },
    { label: 'Meta', value: 'meta' },
    { label: 'Amazon', value: 'amazon' },
    { label: 'Microsoft', value: 'microsoft' },
    { label: 'Apple', value: 'apple' },
    { label: 'SQL', value: 'sql' },
    { label: 'Design', value: 'design' },
    { label: 'Graphs', value: 'graph' }
]

export default function PlaylistGrid({ playlists, stats, isPremium }: any) {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')

    const filteredPlaylists = playlists.filter((list: any) => {
        const matchesSearch = list.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              list.description.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesFilter = activeFilter === 'all' 
            ? true 
            : list.filter.toLowerCase().includes(activeFilter) || list.id.includes(activeFilter)

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-10">
            
            {/* 1. Search & Filter Section */}
            <div className="flex flex-col items-center space-y-6">
                
                {/* Search Bar */}
                <div className="relative w-full max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-10 py-4 border text-slate-700 border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-base"
                        placeholder="Search for a company or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap justify-center gap-2">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                activeFilter === filter.value
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.length > 0 ? (
                    filteredPlaylists.map((list: any) => {
                        const stat = stats[list.id] || { total: 0, solved: 0, percent: 0 }
                        const isComplete = stat.percent === 100
                        
                        // 🔒 LOCK LOGIC: Locked if NOT premium AND playlist is NOT google
                        const isLocked = !isPremium && list.id !== 'google'

                        // Render as div if locked (not clickable), Link if unlocked
                        const Wrapper: any = isLocked ? 'div' : Link
                        const wrapperProps = isLocked ? {} : { href: `/coding/${list.id}` }

                        return (
                            <Wrapper 
                                key={list.id} 
                                {...wrapperProps}
                                className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col ${
                                    isLocked 
                                        ? 'border-slate-200 opacity-75 grayscale cursor-not-allowed' // Locked Style
                                        : isComplete 
                                            ? 'border-green-200 bg-green-50/30' 
                                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'
                                }`}
                            >
                                {/* 🔒 PREMIUM BADGE */}
                                {isLocked && (
                                    <div className="absolute top-4 right-4 z-10 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                                        <Lock className="w-3 h-3" /> Premium
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${list.color}`}>
                                        {list.icon}
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <div className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <ListTodo className="w-3.5 h-3.5" />
                                            <span>{stat.total} Qs</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {list.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">
                                    {list.description}
                                </p>

                                {/* Progress Bar Area */}
                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span>{isComplete ? 'Completed' : 'Progress'}</span>
                                        <span className={isComplete ? "text-green-600" : "text-indigo-600"}>
                                            {stat.percent}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                isComplete ? 'bg-green-500' : 'bg-indigo-500'
                                            }`}
                                            style={{ width: `${stat.percent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                    {isLocked ? (
                                        <span className="text-slate-500 font-bold flex items-center gap-2">
                                            Upgrade to Unlock
                                        </span>
                                    ) : isComplete ? (
                                        <span className="flex items-center text-green-600 font-bold">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> All Done
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
                                            Continue Practice
                                        </span>
                                    )}
                                    
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isLocked
                                            ? 'bg-slate-100 text-slate-400'
                                            : isComplete 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white'
                                    }`}>
                                        {isLocked ? <Lock className="w-3 h-3" /> : <ArrowRight className="w-4 h-4" />}
                                    </div>
                                </div>
                            </Wrapper>
                        )
                    })
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No playlists found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setActiveFilter('all')}}
                            className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}