// src/components/ResumeAnalyzerCard.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, FileText, Briefcase, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Clock, Download, Eye } from 'lucide-react'
import { analyzePdfResume } from '@/app/resume/analyze-pdf'
import Link from 'next/link'

export default function ResumeAnalyzerCard({ initialHistory }: { initialHistory: any[] }) {
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [history, setHistory] = useState(initialHistory)
    const resultsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (result && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [result])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.')
            return
        }
        if (file.size > 5 * 1024 * 1024) { 
            alert('File size too large. Max 5MB.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setAnalyzing(true)
        setResult(null)

        const response = await analyzePdfResume(formData)

        if (response.error) {
            alert(response.error)
        } else {
            setResult(response)
            // Optional: Refresh history here if you want real-time updates without reload
        }
        setAnalyzing(false)
    }

    // Helper: Load History Item
    const loadHistoryItem = (item: any) => {
        let parsedFeedback = {};
        try {
            parsedFeedback = JSON.parse(item.feedback);
        } catch (e) {
            console.error("Failed to parse history feedback", e);
        }

        // Reconstruct the result object to match what the AI returns
        const reconstructedResult = {
            overallScore: item.overall_score,
            sectionScores: item.section_scores,
            // If we saved roles inside feedback, extract them, otherwise empty
            recommendedJobRoles: (parsedFeedback as any).recommendedJobRoles || [],
            feedback: parsedFeedback
        };
        setResult(reconstructedResult);
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50'
        if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50'
        return 'text-rose-600 border-rose-500 bg-rose-50'
    }

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500'
        if (score >= 60) return 'bg-amber-500'
        return 'bg-rose-500'
    }

    const FeedbackCard = ({ title, icon: Icon, items, type }: { title: string, icon: any, items: string[], type: 'success' | 'warning' | 'info' }) => {
        if (!items || items.length === 0) return null;
        const colors = {
            success: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-900' },
            warning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', text: 'text-amber-900' },
            info: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-600', text: 'text-indigo-900' },
        }[type];
        return (
            <div className={`rounded-xl border ${colors.border} ${colors.bg} p-6 h-full`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-white ${colors.border} border`}>
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${colors.text}`}>{title}</h3>
                </div>
                <ul className="space-y-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className={`h-5 w-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                            <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* === LEFT SIDEBAR: HISTORY === */}
            <div className="xl:col-span-3 space-y-6">
                <div className="bg-white shadow rounded-xl border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Recent Scans
                    </h3>
                    {history.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No history yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item.id} className="p-3 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-500">
                                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                                        </span>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                            item.overall_score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                            item.overall_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {item.overall_score}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => loadHistoryItem(item)}
                                            className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:text-indigo-600 hover:border-indigo-200"
                                        >
                                            <Eye className="h-3 w-3" /> View
                                        </button>
                                        {item.file_url && (
                                            <a 
                                                href={item.file_url} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-2 text-xs bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                                title="Download PDF"
                                            >
                                                <Download className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* === MAIN CONTENT: UPLOAD & RESULT === */}
            <div className="xl:col-span-9 bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-200">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <Link href="/resume" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Resume Tools
                    </Link>

                    <div className="flex items-center justify-between wrap gap-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-600 rounded-xl p-4 shadow-md">
                                <Upload className="h-8 w-8 text-white" />
                            </div>
                            <div className="ml-5">
                                <h3 className="text-2xl font-bold text-gray-900">Instant Resume Audit</h3>
                                <p className="mt-1 text-gray-500">
                                    Upload your PDF to get AI-powered scores, job matching, and actionable feedback.
                                </p>
                            </div>
                        </div>
                        {result && (
                             <button onClick={() => setResult(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                 Analyze New File
                             </button>
                        )}
                    </div>

                    {!result && (
                        <div className="mt-8 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                            {analyzing ? (
                                <div className="text-center py-4">
                                    <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Analyzing Document...</h3>
                                    <p className="mt-2 text-sm text-gray-500">Extracting text, evaluating skills, and generating insights.</p>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className="space-y-2 text-center block w-full cursor-pointer">
                                    <FileText className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="relative rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                            Click to Upload PDF
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileUpload} />
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Max size 5MB</p>
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {result && (
                    <div ref={resultsRef} className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* ... (Keep your existing Score/Feedback UI logic here) ... */}
                        {/* I am re-using your exact grid layout below for brevity */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 space-y-6">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                                        <h3 className="text-lg font-bold text-slate-700 mb-4">Resume Health Score</h3>
                                        <div className="relative flex items-center justify-center">
                                            <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-8 text-6xl font-black shadow-sm ${getScoreColor(result.overallScore)}`}>{result.overallScore}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                         <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-600"/> Section Breakdown</h4>
                                        <div className="space-y-4">
                                            {Object.entries(result.sectionScores || {}).map(([key, score]: [string, any]) => (
                                                <div key={key}>
                                                    <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-semibold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span><span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{score}/100</span></div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(score)}`} style={{ width: `${score}%` }}></div></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-8 space-y-8">
                                {result.recommendedJobRoles && result.recommendedJobRoles.length > 0 && (
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4"><div className="bg-white/20 p-2 rounded-lg"><Briefcase className="h-6 w-6 text-white" /></div><h3 className="text-xl font-bold">Best Fit Career Paths</h3></div>
                                            <div className="flex flex-wrap gap-3">
                                                {result.recommendedJobRoles.map((role: string, index: number) => (
                                                    <Link key={index} href={`/quiz?role=${encodeURIComponent(role)}`} className="group flex items-center gap-2 px-5 py-2.5 bg-white/90 text-indigo-900 rounded-full shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer font-semibold text-sm">{role}<ArrowRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition-transform" /></Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FeedbackCard title="Key Strengths" icon={CheckCircle2} items={result.feedback?.strengths} type="success" />
                                    <FeedbackCard title="Critical Weaknesses" icon={AlertTriangle} items={result.feedback?.weaknesses} type="warning" />
                                    <div className="md:col-span-2"><FeedbackCard title="Actionable Improvements Plan" icon={Lightbulb} items={result.feedback?.improvements} type="info" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}