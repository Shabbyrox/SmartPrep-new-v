// src/app/coding/page.tsx
import { CODING_PLAYLISTS } from '@/lib/coding-playlists'
import { Sparkles, Flame } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import PlaylistGrid from '@/components/PlaylistGrid'

export default async function CodingLibraryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Parallel Data Fetching by promise.all
    const [solvedResponse, questionsResponse] = await Promise.all([
        supabase
            .from('user_leetcode_progress')
            .select('question_id')
            .eq('user_id', user?.id)
            .eq('status', 'solved'),
        
        supabase
            .from('leetcode_questions')
            .select('id, company_tags, topic_tags')
    ])

    const solvedData = solvedResponse.data
    const allQuestions = questionsResponse.data
    // O(1) lookup for solved questions
    const solvedSet = new Set(solvedData?.map(s => s.question_id))

    // Calculate Stats (Per Playlist & Global)
    const playlistStats: Record<string, { total: number, solved: number, percent: number }> = {}
    let globalTotal = 0
    let globalSolved = 0

    CODING_PLAYLISTS.forEach(list => {
        const relevantQuestions = allQuestions?.filter(q => 
            q.company_tags?.includes(list.filter) || 
            q.topic_tags?.includes(list.filter)
        ) || []

        const total = relevantQuestions.length
        const solved = relevantQuestions.filter(q => solvedSet.has(q.id)).length
        const percent = total > 0 ? Math.round((solved / total) * 100) : 0

        playlistStats[list.id] = { total, solved, percent }
        
        // Add to Global Totals
        globalTotal += total
        globalSolved += solved
    })

    const globalPercent = globalTotal > 0 ? Math.round((globalSolved / globalTotal) * 100) : 0

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-96 bg-gradient-to-l from-indigo-50 via-slate-50 to-transparent -z-10" />
            
            <div className="max-w-7xl mx-auto px-6 py-12">
                
                {/* Split Header Layout */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    
                    {/* Left Side: Typography */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-200">
                            <Sparkles className="w-3 h-3" />
                            Placement Ready
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                            Your Personal <br/>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-violet-600">
                                Coding Arena
                            </span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Stop grinding random questions. Master the <span className="font-semibold text-slate-900">Top Questions</span> asked by FAANG companies. Verified with real interview data.
                        </p>
                    </div>

                    {/* Right Side: Global Progress Card */}
                    <div className="w-full md:w-auto min-w-[280px]">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Solved</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {globalSolved} <span className="text-slate-400 text-lg font-medium">/ {globalTotal}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Global Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-500">
                                    <span>Mastery</span>
                                    <span>{globalPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${globalPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Interactive Grid */}
                <PlaylistGrid playlists={CODING_PLAYLISTS} stats={playlistStats} />

            </div>
        </div>
    )
}