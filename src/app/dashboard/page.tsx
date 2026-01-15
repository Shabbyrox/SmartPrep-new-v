// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'  
import { Suspense } from 'react'
import { StatsSection, ChartsSection, RoleProgressSection, RecentActivitySection } from '@/app/dashboard/DashboardSections'
import { StatsSkeleton, ChartSkeleton, RoleProgressSkeleton, ActivitySkeleton } from '@/app/dashboard/Skeletons'

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Fetch User ONLY (Fast!)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Fetch Profile name (Fast - single row)
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
                    </h1>
                    <p className="mt-2 text-gray-600">Here's how you're doing on your learning journey.</p>
                </div>

                {/* 3. Stream in the components independently */}
                
                <Suspense fallback={<StatsSkeleton />}>
                    <StatsSection userId={user.id} />
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                    <ChartsSection userId={user.id} />
                </Suspense>

                {/* NEW SECTION HERE */}
                <Suspense fallback={<ActivitySkeleton />}>
                    <RecentActivitySection userId={user.id} />
                </Suspense>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Role Progress</h2>
                <Suspense fallback={<RoleProgressSkeleton />}>
                    <RoleProgressSection userId={user.id} />
                </Suspense>

                <div className="mt-8 flex justify-end">
                    <Link
                        href="/quiz"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Go to Quizzes
                    </Link>
                </div>
            </div>
        </div>
    )
}