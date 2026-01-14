'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Briefcase, MapPin, Globe, Phone, Save, Loader2, Plus, X, Camera } from 'lucide-react'

export default function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const supabase = createClient()
    const router = useRouter()
    
    // UI States
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    
    // Form States
    const [skills, setSkills] = useState<string[]>(profile?.skills || [])
    const [newSkill, setNewSkill] = useState('')

    // --- HELPER: Get Initials ---
    const getInitials = (name: string) => {
        const displayName = name || user.email || 'User'
        return displayName
            .split(' ')
            .map((n: String) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
    }

    // --- HELPER: Get Consistent Color based on Name ---
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
            'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
            'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
            'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
            'bg-pink-500', 'bg-rose-500'
        ]
        const charCodeSum = (name || user.email || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        return colors[charCodeSum % colors.length]
    }

    // --- SKILL HANDLERS ---
    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill('')
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        
        const updates = {
            id: user.id,
            full_name: formData.get('fullName'),
            username: formData.get('username'),
            website: formData.get('website'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            target_role: formData.get('targetRole'),
            preferred_industry: formData.get('preferredIndustry'),
            skills: skills,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)

        if (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Failed to update profile.' })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            router.refresh()
            setTimeout(() => setMessage(null), 3000)
        }
        setLoading(false)
    }

    // --- REUSABLE INPUT ---
    const ModernInput = ({ label, name, defaultValue, icon: Icon, placeholder, type = "text" }: any) => (
        <div className="space-y-2">
            <label htmlFor={name} className="text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-2.5 text-slate-400">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    id={name}
                    defaultValue={defaultValue || ''}
                    placeholder={placeholder}
                    className={`block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${Icon ? 'pl-10' : ''}`}
                />
            </div>
        </div>
    )

    const displayName = profile?.full_name || user.email?.split('@')[0]

    return (
        <div className="space-y-6">
            
            {/* 1. Header & Avatar Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="h-16 bg-white"> </div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-4">
                        <div className={`h-24 w-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-white ${getAvatarColor(displayName)}`}>
                            {getInitials(displayName)}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                        <p className="text-slate-500 text-sm">{user.email}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 2. Personal Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-600" />
                            Personal Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModernInput label="Full Name" name="fullName" defaultValue={profile?.full_name} placeholder="John Doe" />
                        <ModernInput label="Username" name="username" defaultValue={profile?.username} placeholder="johndoe" />
                        <ModernInput label="Phone Number" name="phone" defaultValue={profile?.phone} icon={Phone} placeholder="+1 (555) 000-0000" />
                        <ModernInput label="Location" name="location" defaultValue={profile?.location} icon={MapPin} placeholder="San Francisco, CA" />
                        <div className="md:col-span-2">
                            <ModernInput label="Website / Portfolio" name="website" defaultValue={profile?.website} icon={Globe} placeholder="https://yourportfolio.com" />
                        </div>
                    </div>
                </div>

                {/* 3. Professional Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-indigo-600" />
                            Professional Details
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModernInput label="Target Role" name="targetRole" defaultValue={profile?.target_role} placeholder="Software Engineer" />
                        <ModernInput label="Preferred Industry" name="preferredIndustry" defaultValue={profile?.preferred_industry} placeholder="Fintech, HealthTech" />
                        
                        {/* Interactive Skills UI */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Skills</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Add a skill (e.g. React, Python) and press Enter"
                                />
                                <button onClick={handleAddSkill} type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-400 hover:text-indigo-600 focus:outline-none">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                {skills.length === 0 && <p className="text-xs text-slate-500 italic">No skills added yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    {message && (
                        <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}