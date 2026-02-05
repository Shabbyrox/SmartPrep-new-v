// app/resume/builder/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { ResumeData, initialResumeData } from '@/types/resume'
import ResumeForm from '@/components/ResumeForm'
import { ResumePreview } from '@/components/ResumePreview'
import { Download, ArrowLeft, Loader2, Sparkles, AlertCircle, CheckCircle2, XCircle, Lightbulb, Save } from 'lucide-react'
import { analyzeResume } from '../analyze'
import { saveResume, loadResume } from './actions'
import Link from 'next/link'

export default function ResumeBuilder() {
    const [data, setData] = useState<ResumeData>(initialResumeData)
    const [analyzing, setAnalyzing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    
    // The Ref for the Ghost Printer Element
    const componentRef = useRef<HTMLDivElement>(null)
    const analysisRef = useRef<HTMLDivElement>(null)

    // Load Saved Data on Mount
    useEffect(() => {
        const fetchSavedData = async () => {
            const saved = await loadResume()
            if (saved) {
                setData(saved)
            }
        }
        fetchSavedData()
    }, [])

    useEffect(() => {
        if (analysisResult && analysisRef.current) {
            analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [analysisResult])

    // 👇 FIX: Updated for react-to-print v7+
    const handlePrint = useReactToPrint({
        contentRef: componentRef, // Pass the ref directly (no function needed)
        documentTitle: `${data.personalInfo.fullName}_Resume`,
    })

    const handleSave = async () => {
        setSaving(true)
        const result = await saveResume(data)
        setSaving(false)
        if (result.error) {
            alert(result.error)
        } else {
            alert('Draft saved successfully!') 
        }
    }

    const handleAnalyze = async () => {
        setAnalyzing(true)
        setAnalysisResult(null)
        await saveResume(data) 
        
        const result = await analyzeResume(data)
        if (result.error) {
            alert(result.error)
        } else {
            setAnalysisResult(result)
        }
        setAnalyzing(false)
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
    const InsightCard = ({ title, items, type }: { title: string, items: string[], type: 'success' | 'danger' | 'info' }) => {
        if (!items || items.length === 0) return null
        const styles = {
            success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: CheckCircle2, iconColor: 'text-emerald-600' },
            danger: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: XCircle, iconColor: 'text-rose-600' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: Lightbulb, iconColor: 'text-blue-600' },
        }[type]
        const Icon = styles.icon
        return (
            <div className={`rounded-xl border ${styles.border} ${styles.bg} p-5 mb-4 shadow-sm`}>
                <div className="flex items-center gap-2 mb-3 border-b border-black/5 pb-2">
                    <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                    <h4 className={`font-bold text-lg ${styles.text} uppercase tracking-wide`}>{title}</h4>
                </div>
                <ul className="space-y-2">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-current opacity-60`} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-4">
                             <Link href="/resume" className="text-slate-500 hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                AI Resume Builder
                            </h1>
                        </div>
                        {/* Mobile Actions */}
                         <div className="flex md:hidden gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || analyzing}
                                className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </button>
                         </div>
                    </div>
                    
                    {/* Desktop Actions */}
                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving || analyzing}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2 text-slate-500" />
                            )}
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>

                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                    AI Review
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handlePrint()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </button>
                    </div>

                    {/* Mobile Actions Stack */}
                    <div className="flex md:hidden w-full gap-2">
                         <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
                        >
                            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />}
                            {analyzing ? 'Analyzing...' : 'AI Review'}
                        </button>
                        <button
                            onClick={() => handlePrint()}
                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Form */}
                    <div className="w-full lg:w-1/2 xl:w-2/5 h-auto lg:h-[calc(100vh-140px)] lg:overflow-y-auto pr-2 custom-scrollbar">
                        <ResumeForm data={data} onChange={setData} />

                        {/* AI Feedback Area */}
                        {analysisResult && (
                            <div ref={analysisRef} className="mt-8 bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-indigo-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Resume Audit</h3>
                                            <p className="text-sm text-slate-500 mt-1">AI-powered analysis of your profile</p>
                                        </div>
                                        <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 ${getScoreColor(analysisResult.overallScore)}`}>
                                            <span className="text-2xl font-bold">{analysisResult.overallScore}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">Score</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(analysisResult.sectionScores || {}).map(([key, score]: [string, any]) => (
                                            <div key={key} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-slate-600 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                        {score}/100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                    <div 
                                                        className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressColor(score)}`} 
                                                        style={{ width: `${score}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50">
                                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-indigo-500" />
                                        Detailed Feedback
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <InsightCard 
                                            title="Key Strengths" 
                                            items={analysisResult.feedback?.strengths} 
                                            type="success" 
                                        />
                                        <InsightCard 
                                            title="Areas to Improve" 
                                            items={analysisResult.feedback?.weaknesses} 
                                            type="danger" 
                                        />
                                        <InsightCard 
                                            title="Actionable Suggestions" 
                                            items={analysisResult.feedback?.suggestions} 
                                            type="info" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Visible Preview (Hidden on Mobile) */}
                    <div className="hidden lg:flex w-full lg:w-1/2 xl:w-3/5 bg-slate-200/50 p-8 rounded-xl border border-slate-200 justify-center items-start overflow-y-auto h-[calc(100vh-140px)]">
                        <div className="transform scale-[0.85] origin-top shadow-2xl">
                            {/* NOTE: Just for display, not printing */}
                            <ResumePreview data={data} />
                        </div>
                    </div>
                    
                    {/* Mobile Preview Message */}
                    <div className="lg:hidden w-full bg-slate-100 p-4 rounded-lg text-center text-sm text-slate-500">
                        Switch to Desktop to see Live Preview
                    </div>
                </div>
            </main>

            {/* GHOST PREVIEW FOR PRINTING (Hidden from screen, but available to printer) */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <ResumePreview ref={componentRef} data={data} />
            </div>
        </div>
    )
}