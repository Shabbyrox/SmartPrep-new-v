import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'  
import { Suspense } from 'react'
import { StatsSection, ChartsSection, RoleProgressSection, RecentActivitySection } from '@/app/dashboard/DashboardSections'
import { StatsSkeleton, ChartSkeleton, RoleProgressSkeleton, ActivitySkeleton } from '@/app/dashboard/Skeletons'
import FeedbackContext from '@/components/FeedbackContext'

// 👇 New Imports for the Widgets
import LeetCodeWidget from '@/components/LeetCodeWidget'
import DailyGoalCard from '@/components/DailyGoalCard'
import { getUserStreak } from '@/lib/streak'

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Fetch User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch Profile, Feedback & Streak Data in Parallel (Faster)
    const [profileRes, feedbackRes, streakRes] = await Promise.all([
        supabase.from('profiles').select('full_name, leetcode_username').eq('id', user.id).single(),
        supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        getUserStreak(user.id)
    ])

    const profile = profileRes.data
    const hasGivenFeedback = feedbackRes.count !== null && feedbackRes.count > 0
    const { currentStreak, hasSolvedToday } = streakRes

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <div className="flex items-center flex-wrap gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
                        </h1>
                        {!hasGivenFeedback && <FeedbackContext />}
                    </div>
                    <p className="mt-2 text-gray-600">Here's how you're doing on your learning journey.</p>
                </div>

                {/* --- SECTION 1: STATS (Full Width) --- */}
                <Suspense fallback={<StatsSkeleton />}>
                    <StatsSection userId={user.id} />
                </Suspense>

                {/* --- SECTION 2: CHARTS (Full Width - Preserved!) --- */}
                <div className="mb-8">
                    <Suspense fallback={<ChartSkeleton />}>
                        <ChartsSection userId={user.id} />
                    </Suspense>
                </div>

                {/* --- SECTION 3: SPLIT LAYOUT (Activity vs. Widgets) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN (2/3): Activity Feed & Roles */}
                    <div className="lg:col-span-2 space-y-8">
                        <Suspense fallback={<ActivitySkeleton />}>
                            <RecentActivitySection userId={user.id} />
                        </Suspense>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Role Progress</h2>
                            <Suspense fallback={<RoleProgressSkeleton />}>
                                <RoleProgressSection userId={user.id} />
                            </Suspense>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (1/3): The New Widgets */}
                    <div className="space-y-6">
                        
                        {/* 1. Daily Streak Card */}
                        <DailyGoalCard 
                            streak={currentStreak} 
                            hasSolvedToday={hasSolvedToday} 
                        />

                        {/* 2. LeetCode Connection Widget */}
                        <LeetCodeWidget initialUsername={profile?.leetcode_username} />

                        {/* 3. Quick Action Button */}
                        <div className="pt-2">
                             <Link
                                href="/quiz"
                                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                            >
                                Take a New Quiz
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}