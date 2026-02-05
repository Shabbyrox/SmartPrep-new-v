// src/components/ResumePreview.tsx
import React from 'react'
import { ResumeData } from '@/types/resume'

interface ResumePreviewProps {
    data: ResumeData
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(
    ({ data }, ref) => {
        const renderSection = (sectionId: string) => {
            switch (sectionId) {
                case 'education':
                    if (data.education.length === 0) return null
                    return (
                        <div key="education" className="mb-4 break-inside-avoid">
                            <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-2">
                                Education
                            </h2>
                            {data.education.map((edu, index) => (
                                <div key={index} className="mb-2">
                                    <div className="flex justify-between font-bold">
                                        <span>{edu.degree}</span>
                                        <span>
                                            {edu.startDate} - {edu.endDate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between italic">
                                        <span>{edu.college}</span>
                                        <span>CGPA: {edu.cgpa}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                case 'projects':
                    if (data.projects.length === 0) return null
                    return (
                        <div key="projects" className="mb-4 break-inside-avoid">
                            <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-2">
                                Projects
                            </h2>
                            {data.projects.map((proj, index) => (
                                <div key={index} className="mb-3">
                                    <div className="flex justify-between font-bold">
                                        <span>
                                            {proj.title} | <span className="underline">{proj.link}</span>
                                        </span>
                                        <span>{proj.date}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5">
                                        {proj.points.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )
                case 'skills':
                    if (data.skills.length === 0) return null
                    return (
                        <div key="skills" className="mb-4 break-inside-avoid">
                            <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-2">
                                Skills
                            </h2>
                            <ul className="list-disc list-outside ml-4 space-y-0.5">
                                {data.skills.map((skill, index) => (
                                    <li key={index}>
                                        <span className="font-bold">{skill.category}:</span> {skill.items}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                case 'achievements':
                    if (data.achievements.length === 0) return null
                    return (
                        <div key="achievements" className="mb-4 break-inside-avoid">
                            <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-2">
                                Achievements
                            </h2>
                            <ul className="list-disc list-outside ml-4 space-y-0.5">
                                {data.achievements.map((ach, index) => (
                                    <li key={index}>{ach}</li>
                                ))}
                            </ul>
                        </div>
                    )
                case 'coCurricular':
                    if (data.coCurricular.length === 0) return null
                    return (
                        <div key="coCurricular" className="mb-4 break-inside-avoid">
                            <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-2">
                                Co-Curricular Activities
                            </h2>
                            {data.coCurricular.map((activity, index) => (
                                <div key={index} className="mb-3">
                                    <div className="font-bold">{activity.title}</div>
                                    <div className="flex justify-between italic mb-1">
                                        <span>{activity.role}</span>
                                        <span>{activity.date}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-0.5">
                                        {activity.points.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )
                default:
                    return null
            }
        }

        return (
            <div
                ref={ref}
                // Updated ClassName: Added 'shadow-xl' for screen and 'print:shadow-none' for PDF
                className="bg-white p-8 mx-auto text-gray-900 font-serif text-sm leading-relaxed shadow-xl print:shadow-none print:m-0"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    // Removed inline boxShadow so Tailwind classes can control it
                }}
            >
                {/* Header */}
                <div className="text-center border-b-2 border-gray-300 pb-2 mb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-xs text-gray-700 flex justify-center gap-2 flex-wrap">
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.phone && data.personalInfo.email && <span>•</span>}
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.email && data.personalInfo.linkedin && <span>•</span>}
                        {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
                        {data.personalInfo.linkedin && data.personalInfo.github && <span>•</span>}
                        {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
                    </div>
                </div>

                {/* Dynamic Sections */}
                {data.sectionOrder.map(sectionId => renderSection(sectionId))}
            </div>
        )
    }
)

ResumePreview.displayName = 'ResumePreview'