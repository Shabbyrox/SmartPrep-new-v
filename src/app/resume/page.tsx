// src/app/resume/page.tsx
'use client'

import Link from 'next/link'
import { FileText, Search, Briefcase, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResumeHub() {
  const tools = [
    {
      title: 'AI Resume Builder',
      description: 'Create a professional, ATS-friendly resume from scratch using our step-by-step AI builder.',
      icon: <FileText className="h-8 w-8 text-white" />,
      color: 'bg-blue-600',
      href: '/resume/builder', 
      badge: 'Most Popular'
    },
    {
      title: 'Resume Analyzer',
      description: 'Upload your existing PDF resume. Get an instant score (0-100) and actionable feedback.',
      icon: <Search className="h-8 w-8 text-white" />,
      color: 'bg-purple-600',
      href: '/resume/upload',
      badge: 'AI Powered'
    },
    {
      title: 'Job Matcher',
      description: 'Paste a Job Description (JD) and your resume to see how well you match the role.',
      icon: <Briefcase className="h-8 w-8 text-white" />,
      color: 'bg-emerald-600',
      href: '/resume/jd-analysis',
      badge: 'New'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Resume Intelligence Suite
          </h1>
          <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
            Everything you need to land your dream job. Build, analyze, and optimize your resume in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tools.map((tool, index) => (
            <Link key={tool.title} href={tool.href} className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Header with Icon */}
                <div className={`${tool.color} p-6 flex justify-between items-start`}>
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-md">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Start Now 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}