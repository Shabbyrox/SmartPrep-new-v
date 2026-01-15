// src/components/JDAnalyzerCard.tsx
'use client'

import { useState } from 'react'
import { Upload, Loader2, FileText, Target, CheckCircle2, AlertCircle, ArrowLeft, XCircle, Lightbulb, Clock, Eye, Download } from 'lucide-react'
import { analyzeResumeWithJD } from '@/app/resume/analyze-jd'
import Link from 'next/link'

export default function JDAnalyzerCard({ initialHistory }: { initialHistory: any[] }) {
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [jobRole, setJobRole] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [history, setHistory] = useState(initialHistory)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0]
            
            // 👇 Check if file is larger than 5MB (5 * 1024 * 1024 bytes)
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert("File is too large! Please upload a resume smaller than 5MB.")
                e.target.value = "" // Clear the input so they can try again
                setFile(null)       // Clear state
                return
            }

            setFile(selectedFile)
        }
    }

    const handleAnalyze = async () => {
        if (!file || !jobRole || !jobDescription) return

        setAnalyzing(true)
        setResult(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('jobRole', jobRole)
        formData.append('jobDescription', jobDescription)

        const response = await analyzeResumeWithJD(formData)

        if (response.error) {
            alert(response.error)
        } else {
            setResult(response)
            // Optional: You could manually append response to history here if desired
        }
        setAnalyzing(false)
    }

    // 👇 RESTORE HISTORY ITEM
    const loadHistoryItem = (item: any) => {
        let parsedData: any = {}
        try {
            parsedData = JSON.parse(item.feedback)
        } catch (e) {
            console.error("Parse error", e)
        }

        setResult({
            matchScore: item.overall_score,
            missingKeywords: parsedData.missingKeywords || [],
            feedback: parsedData // contains strengths, gaps, etc.
        })
        setJobRole(item.job_role || '') // Show which job this was for
        setJobDescription('') // Clear JD as we don't save the full text
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50'
        if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50'
        return 'text-rose-600 border-rose-500 bg-rose-50'
    }

    const InsightColumn = ({ title, icon: Icon, items, type }: any) => {
        const styles = {
            // 👇 Explicitly added 'dot' property so Tailwind sees these classes
            success: { 
                bg: 'bg-emerald-50/50', 
                border: 'border-emerald-100', 
                text: 'text-emerald-900', 
                icon: 'text-emerald-600', 
                dot: 'bg-emerald-600' 
            },
            danger: { 
                bg: 'bg-rose-50/50', 
                border: 'border-rose-100', 
                text: 'text-rose-900', 
                icon: 'text-rose-600', 
                dot: 'bg-rose-600' 
            },
            info: { 
                bg: 'bg-blue-50/50', 
                border: 'border-blue-100', 
                text: 'text-blue-900', 
                icon: 'text-blue-600', 
                dot: 'bg-blue-600' 
            }
        }[type as 'success' | 'danger' | 'info']

        if (!items || items.length === 0) return null;

        return (
            <div className={`rounded-xl border ${styles.border} ${styles.bg} p-6 h-full transition-all hover:shadow-sm`}>
                <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2 rounded-lg bg-white border ${styles.border} shadow-sm`}>
                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${styles.text}`}>{title}</h3>
                </div>
                <ul className="space-y-4">
                    {items.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                            {/* 👇 Now using styles.dot directly */}
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
                            <span>{item}</span>
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
                        <Clock className="h-4 w-4" /> Recent Matches
                    </h3>
                    {history.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No history yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item.id} className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                                        </span>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                            item.overall_score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                            item.overall_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {item.overall_score}%
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <p className="font-semibold text-sm text-slate-800 line-clamp-1">{item.job_role || 'Unknown Role'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => loadHistoryItem(item)}
                                            className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:text-blue-600 hover:border-blue-200"
                                        >
                                            <Eye className="h-3 w-3" /> View
                                        </button>
                                        {item.file_url && (
                                            <a 
                                                href={item.file_url} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-2 text-xs bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                title="Download Resume Used"
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

            {/* === MAIN CONTENT === */}
            <div className="xl:col-span-9 bg-white overflow-hidden shadow-lg rounded-2xl border border-slate-200">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                    <Link href="/resume" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Resume Tools
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="flex-shrink-0 bg-blue-600 rounded-xl p-4 shadow-md">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">JD Match Analysis</h3>
                                <p className="mt-1 text-gray-500">Compare your resume against a specific job description.</p>
                            </div>
                        </div>
                        
                        {result && (
                             <button onClick={() => { setResult(null); setJobRole(''); }} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                Analyze New Job
                             </button>
                        )}
                    </div>
                </div>

                {/* Input Form Section */}
                {!result && (
                    <div className="p-8 max-w-4xl mx-auto space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Role</label>
                                    <input
                                        type="text"
                                        className="block w-full text-black rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                                        placeholder="e.g. Senior Product Designer"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description (JD)</label>
                                    <textarea
                                        rows={8}
                                        className="block w-full text-black rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border resize-none"
                                        placeholder="Paste the full JD here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Resume</label>
                                <div className="flex-1 flex flex-col justify-center px-6 py-10 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group bg-slate-50/50">
                                    <div className="text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <FileText className="h-8 w-8 text-indigo-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>{file ? file.name : 'Click to Upload PDF'}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                            </label>
                                            {!file && <p className="text-sm text-gray-500">or drag and drop</p>}
                                        </div>
                                        <p className="text-xs text-gray-400">PDF up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || !jobRole || !jobDescription || analyzing}
                                className={`w-full md:w-auto md:min-w-[200px] flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-bold text-white transition-all ${!file || !jobRole || !jobDescription || analyzing
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                                    }`}
                            >
                                {analyzing ? (
                                    <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Analyzing Fit...</>
                                ) : ('Analyze Match')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                            <div className="lg:col-span-4 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 "></div>
                                <h3 className="text-lg font-bold text-slate-700 mb-6">ATS Match Score</h3>
                                <div className={`relative flex items-center justify-center w-40 h-40 rounded-full border-8 text-6xl font-black shadow-sm ${getScoreColor(result.matchScore)}`}>
                                    {result.matchScore}%
                                </div>
                                <p className="mt-6 text-slate-500 font-medium px-4">
                                    {result.feedback?.summary}
                                </p>
                            </div>

                            <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertCircle className="h-6 w-6 text-rose-500" />
                                    <h3 className="text-xl font-bold text-slate-900">Missing Keywords</h3>
                                </div>
                                <p className="text-slate-600 mb-6">
                                    These important terms were found in the JD but are missing from your resume.
                                </p>
                                {result.missingKeywords && result.missingKeywords.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {result.missingKeywords.map((keyword: string, idx: number) => (
                                            <span key={idx} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-white text-rose-700 border border-rose-200 shadow-sm">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-white p-4 rounded-lg border border-emerald-100 inline-block">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="font-semibold">Perfect! No major keywords missing.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InsightColumn title="Matching Strengths" icon={CheckCircle2} items={result.feedback?.strengths} type="success" />
                            <InsightColumn title="Critical Gaps" icon={XCircle} items={result.feedback?.gaps} type="danger" />
                            <InsightColumn title="Recommendations" icon={Lightbulb} items={result.feedback?.recommendations} type="info" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 