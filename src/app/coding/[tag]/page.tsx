// src/app/coding/[tag]/page.tsx
import { createClient } from '@/utils/supabase/server'
import LeetCodeCard from '@/components/LeetCodeCard'
import { CODING_PLAYLISTS } from '@/lib/coding-playlists'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PlaylistPage({ params }: { params: Promise<{ tag: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const { tag } = await params

    // 1. Find which playlist this is
    const playlist = CODING_PLAYLISTS.find(p => p.id === tag)
    if (!playlist) return notFound()

    // 2. Fetch Questions based on the filter
    const { data: questions } = await supabase
        .from('leetcode_questions')
        .select('*')
        .or(`company_tags.cs.{${playlist.filter}},topic_tags.cs.{${playlist.filter}}`)
        .order('difficulty', { ascending: true })

    // 3. Fetch User Progress (Includes 'solved_at' for Revision Logic)
    const { data: progress } = await supabase
        .from('user_leetcode_progress')
        .select('question_id, solved_at') // 👈 Fetches the date
        .eq('user_id', user.id)

    // Create a Map for easy lookup: ID -> Date String
    const progressMap = new Map(progress?.map((p) => [p.question_id, p.solved_at]))

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/coding" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                </Link>

                {/* Header with your custom gradient */}
                <div className={`mb-8 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg`}>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/10 text-white border border-white/20`}>
                        Verified List
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
                    <p className="text-slate-300">{playlist.description}</p>
                </div>

                <div className="space-y-4">
                    {questions && questions.length > 0 ? (
                        questions.map((q) => (
                            <LeetCodeCard 
                                key={q.id} 
                                question={q} 
                                // 👇 Updated: Pass the date instead of just boolean
                                solvedAt={progressMap.get(q.id)} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No questions found for this list yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Admin needs to add questions with tag: {playlist.filter}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}