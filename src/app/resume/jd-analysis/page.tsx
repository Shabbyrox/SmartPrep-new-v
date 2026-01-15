// src/app/resume/jd-analysis/page.tsx
import JDAnalyzerCard from '@/components/JDAnalyzerCard'
import { createClient } from '@/utils/supabase/server'

export default async function JDAnalysisPage() {
    const supabase = await createClient()

    // 👇 Fetch only 'jd_match' history
    const { data: history } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('source', 'jd_match')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Job Description Matcher</h1>
                    <p className="mt-2 text-slate-600">
                        Check if your resume passes the ATS filter for your dream job.
                    </p>
                </div>
                {/* 👇 Pass history to the component */}
                <JDAnalyzerCard initialHistory={history || []} />
            </div>
        </div>
    )
}