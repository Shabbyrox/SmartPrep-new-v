// src/app/resume/upload/page.tsx
import ResumeAnalyzerCard from '@/components/ResumeAnalyzerCard'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ResumeUploadPage() {
    const supabase = await createClient()
    
    // Fetch History
    const { data: history } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('source', 'pdf_scan')
        .order('created_at', { ascending: false })
    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Quick Resume Analysis</h1>
                    <p className="mt-2 text-slate-600">
                        Get detailed insights, score breakdowns, and job matching.
                    </p>
                    
                </div>

                {/* Pass history to the component */}
                <ResumeAnalyzerCard initialHistory={history || []} />
            </div>
        </div>
    )
}