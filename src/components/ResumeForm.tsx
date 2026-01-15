// src/components/ResumeForm.tsx
import { useState } from 'react'
import { ResumeData } from '@/types/resume'
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    GraduationCap,
    Briefcase,
    Award,
    Code,
    BookOpen,
    ArrowUp,
    ArrowDown
} from 'lucide-react'

interface ResumeFormProps {
    data: ResumeData
    onChange: (data: ResumeData) => void
}

interface SectionProps {
    title: string
    icon: React.ElementType
    id: string
    expanded: string | null
    onToggle: (id: string) => void
    children: React.ReactNode
    onAdd?: () => void
    onMoveUp?: () => void
    onMoveDown?: () => void
    isFirst?: boolean
    isLast?: boolean
}

const Section = ({ title, icon: Icon, id, expanded, onToggle, children, onAdd, onMoveUp, onMoveDown, isFirst, isLast }: SectionProps) => {
    const isOpen = expanded === id
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div
                className={`flex items-center justify-between p-4 cursor-pointer ${isOpen ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => onToggle(id)}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={20} />
                    </div>
                    <span className={`font-semibold truncate ${isOpen ? 'text-indigo-900' : 'text-gray-700'}`}>{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {onMoveUp && !isFirst && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onMoveUp()
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                            title="Move Up"
                        >
                            <ArrowUp size={16} />
                        </button>
                    )}
                    {onMoveDown && !isLast && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onMoveDown()
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                            title="Move Down"
                        >
                            <ArrowDown size={16} />
                        </button>
                    )}
                    {onAdd && isOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onAdd()
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                            title="Add Item"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                    {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {isOpen && (
                <div className="p-5 border-t border-indigo-100 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    )
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
    const [expanded, setExpanded] = useState<string | null>('personalInfo')

    const toggleSection = (section: string) => {
        setExpanded(expanded === section ? null : section)
    }

    const handleChange = (section: keyof ResumeData, field: string, value: string) => {
        onChange({
            ...data,
            [section]: {
                ...data[section as keyof ResumeData],
                [field]: value,
            },
        })
    }

    // Helper to update array items
    const updateArrayItem = (section: keyof ResumeData, index: number, field: string, value: string) => {
        const newArray = [...(data[section] as any[])]
        newArray[index] = { ...newArray[index], [field]: value }
        onChange({ ...data, [section]: newArray })
    }

    // Helper to update simple string arrays (Achievements)
    const updateStringArrayItem = (section: keyof ResumeData, index: number, value: string) => {
        const newArray = [...(data[section] as string[])]
        newArray[index] = value
        onChange({ ...data, [section]: newArray })
    }

    // Helper to update points array inside an object (Projects, CoCurricular)
    const updatePoints = (section: keyof ResumeData, itemIndex: number, pointIndex: number, value: string) => {
        const newArray = [...(data[section] as any[])]
        const newPoints = [...newArray[itemIndex].points]
        newPoints[pointIndex] = value
        newArray[itemIndex] = { ...newArray[itemIndex], points: newPoints }
        onChange({ ...data, [section]: newArray })
    }

    // Add item to array
    const addItem = (section: keyof ResumeData, initialItem: any) => {
        onChange({
            ...data,
            [section]: [...(data[section] as any[]), initialItem],
        })
    }

    // Remove item from array
    const removeItem = (section: keyof ResumeData, index: number) => {
        const newArray = [...(data[section] as any[])]
        newArray.splice(index, 1)
        onChange({ ...data, [section]: newArray })
    }

    // Add point to item
    const addPoint = (section: keyof ResumeData, itemIndex: number) => {
        const newArray = [...(data[section] as any[])]
        newArray[itemIndex] = {
            ...newArray[itemIndex],
            points: [...newArray[itemIndex].points, ''],
        }
        onChange({ ...data, [section]: newArray })
    }

    // Remove point from item
    const removePoint = (section: keyof ResumeData, itemIndex: number, pointIndex: number) => {
        const newArray = [...(data[section] as any[])]
        const newPoints = [...newArray[itemIndex].points]
        newPoints.splice(pointIndex, 1)
        newArray[itemIndex] = { ...newArray[itemIndex], points: newPoints }
        onChange({ ...data, [section]: newArray })
    }

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...data.sectionOrder]
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
        }
        onChange({ ...data, sectionOrder: newOrder })
    }

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
    const labelClass = "block text-sm font-medium text-gray-700 mb-2"

    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'education':
                return (
                    <div className="space-y-6">
                        {data.education.map((edu, index) => (
                            <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50 relative group hover:border-indigo-300 transition-colors">
                                <button
                                    onClick={() => removeItem('education', index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove Education"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <div className="grid gap-5">
                                    <div>
                                        <label className={labelClass}>Degree</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. B.Tech in Computer Science"
                                            value={edu.degree}
                                            onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>College/University</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. MIT"
                                            value={edu.college}
                                            onChange={(e) => updateArrayItem('education', index, 'college', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-5">
                                        <div>
                                            <label className={labelClass}>Start Date</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2020"
                                                value={edu.startDate}
                                                onChange={(e) => updateArrayItem('education', index, 'startDate', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>End Date</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2024"
                                                value={edu.endDate}
                                                onChange={(e) => updateArrayItem('education', index, 'endDate', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>CGPA/Grade</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 9.0"
                                                value={edu.cgpa}
                                                onChange={(e) => updateArrayItem('education', index, 'cgpa', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.education.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No education added yet. Click + to add.
                            </div>
                        )}
                    </div>
                )
            case 'projects':
                return (
                    <div className="space-y-6">
                        {data.projects.map((proj, index) => (
                            <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50 relative group hover:border-indigo-300 transition-colors">
                                <button
                                    onClick={() => removeItem('projects', index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove Project"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <div className="grid gap-5 mb-5">
                                    <div>
                                        <label className={labelClass}>Project Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. E-commerce App"
                                            value={proj.title}
                                            onChange={(e) => updateArrayItem('projects', index, 'title', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Link (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. github.com/project"
                                                value={proj.link}
                                                onChange={(e) => updateArrayItem('projects', index, 'link', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Date</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Jan 2023"
                                                value={proj.date}
                                                onChange={(e) => updateArrayItem('projects', index, 'date', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className={labelClass}>Bullet Points</label>
                                    {proj.points.map((point, pIndex) => (
                                        <div key={pIndex} className="flex gap-2 items-start">
                                            <textarea
                                                placeholder="Describe what you did..."
                                                value={point}
                                                onChange={(e) => updatePoints('projects', index, pIndex, e.target.value)}
                                                className={`${inputClass} text-sm min-h-[70px]`}
                                                rows={2}
                                            />
                                            <button
                                                onClick={() => removePoint('projects', index, pIndex)}
                                                className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addPoint('projects', index)}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center mt-2"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Bullet Point
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.projects.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No projects added yet. Click + to add.
                            </div>
                        )}
                    </div>
                )
            case 'skills':
                return (
                    <div className="space-y-4">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="flex gap-4 items-start group">
                                <div className="w-1/3">
                                    <input
                                        type="text"
                                        placeholder="Category (e.g. Languages)"
                                        value={skill.category}
                                        onChange={(e) => updateArrayItem('skills', index, 'category', e.target.value)}
                                        className={`${inputClass} font-medium`}
                                    />
                                </div>
                                <div className="w-2/3 flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Items (e.g. Python, JS)"
                                        value={skill.items}
                                        onChange={(e) => updateArrayItem('skills', index, 'items', e.target.value)}
                                        className={inputClass}
                                    />
                                    <button
                                        onClick={() => removeItem('skills', index)}
                                        className="mt-2.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.skills.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No skills added yet. Click + to add.
                            </div>
                        )}
                    </div>
                )
            case 'achievements':
                return (
                    <div className="space-y-4">
                        {data.achievements.map((ach, index) => (
                            <div key={index} className="flex gap-3 items-start group">
                                <textarea
                                    placeholder="Describe your achievement..."
                                    value={ach}
                                    onChange={(e) => updateStringArrayItem('achievements', index, e.target.value)}
                                    className={`${inputClass} text-sm`}
                                    rows={3}
                                />
                                <button
                                    onClick={() => removeItem('achievements', index)}
                                    className="mt-2.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        {data.achievements.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No achievements added yet. Click + to add.
                            </div>
                        )}
                    </div>
                )
            case 'coCurricular':
                return (
                    <div className="space-y-6">
                        {data.coCurricular.map((activity, index) => (
                            <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50 relative group hover:border-indigo-300 transition-colors">
                                <button
                                    onClick={() => removeItem('coCurricular', index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove Activity"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <div className="grid gap-5 mb-5">
                                    <div>
                                        <label className={labelClass}>Activity/Organization</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Coding Club"
                                            value={activity.title}
                                            onChange={(e) => updateArrayItem('coCurricular', index, 'title', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Role</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. President"
                                                value={activity.role}
                                                onChange={(e) => updateArrayItem('coCurricular', index, 'role', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Date</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2022 - Present"
                                                value={activity.date}
                                                onChange={(e) => updateArrayItem('coCurricular', index, 'date', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Bullet Points</label>
                                    {activity.points.map((point, pIndex) => (
                                        <div key={pIndex} className="flex gap-2 items-start">
                                            <textarea
                                                placeholder="Describe your role..."
                                                value={point}
                                                onChange={(e) => updatePoints('coCurricular', index, pIndex, e.target.value)}
                                                className={`${inputClass} text-sm min-h-[60px]`}
                                                rows={2}
                                            />
                                            <button
                                                onClick={() => removePoint('coCurricular', index, pIndex)}
                                                className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addPoint('coCurricular', index)}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center mt-1"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Bullet Point
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.coCurricular.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No activities added yet. Click + to add.
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    const sectionConfig: Record<string, { title: string, icon: any, addFn: () => void }> = {
        education: { title: 'Education', icon: GraduationCap, addFn: () => addItem('education', { degree: '', college: '', startDate: '', endDate: '', cgpa: '' }) },
        projects: { title: 'Projects', icon: Briefcase, addFn: () => addItem('projects', { title: '', link: '', date: '', points: [''] }) },
        skills: { title: 'Skills', icon: Code, addFn: () => addItem('skills', { category: '', items: '' }) },
        achievements: { title: 'Achievements', icon: Award, addFn: () => addItem('achievements', '') },
        coCurricular: { title: 'Co-Curricular', icon: BookOpen, addFn: () => addItem('coCurricular', { title: '', role: '', date: '', points: [''] }) }
    }

    return (
        <div className="space-y-6">
            {/* Personal Info - Always First */}
            <Section
                title="Personal Info"
                icon={User}
                id="personalInfo"
                expanded={expanded}
                onToggle={toggleSection}
            >
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={data.personalInfo.fullName}
                            onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input
                                type="text"
                                placeholder="e.g. +1 234 567 890"
                                value={data.personalInfo.phone}
                                onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <input
                                type="text"
                                placeholder="e.g. john@example.com"
                                value={data.personalInfo.email}
                                onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>LinkedIn URL</label>
                        <input
                            type="text"
                            placeholder="e.g. linkedin.com/in/johndoe"
                            value={data.personalInfo.linkedin}
                            onChange={(e) => handleChange('personalInfo', 'linkedin', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>GitHub URL</label>
                        <input
                            type="text"
                            placeholder="e.g. github.com/johndoe"
                            value={data.personalInfo.github}
                            onChange={(e) => handleChange('personalInfo', 'github', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Section>

            {/* Dynamic Sections */}
            {data.sectionOrder.map((sectionId, index) => {
                const config = sectionConfig[sectionId]
                if (!config) return null
                return (
                    <Section
                        key={sectionId}
                        title={config.title}
                        icon={config.icon}
                        id={sectionId}
                        expanded={expanded}
                        onToggle={toggleSection}
                        onAdd={config.addFn}
                        onMoveUp={() => moveSection(index, 'up')}
                        onMoveDown={() => moveSection(index, 'down')}
                        isFirst={index === 0}
                        isLast={index === data.sectionOrder.length - 1}
                    >
                        {renderSectionContent(sectionId)}
                    </Section>
                )
            })}
        </div>
    )
}
