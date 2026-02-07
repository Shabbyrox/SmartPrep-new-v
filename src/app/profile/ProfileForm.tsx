// src/app/profile/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Briefcase, MapPin, Globe, Phone, Save, Loader2, Plus, X, Code, Ticket } from 'lucide-react'
import { updateProfileWithCoupon } from '@/app/actions/profile-update'

// ✅ FIX: ModernInput moved OUTSIDE the main component to prevent re-rendering issues
const ModernInput = ({ label, name, defaultValue, icon: Icon, placeholder, disabled = false, required = false }: any) => (
    <div className="space-y-2">
        <label htmlFor={name} className="text-sm font-medium text-slate-700 flex">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-2.5 text-slate-400">
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <input
                name={name}
                defaultValue={defaultValue || ''}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 ${Icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
)

export default function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [skills, setSkills] = useState<string[]>(profile?.skills || [])
    const [newSkill, setNewSkill] = useState('')

    // Helpers
    const getInitials = (name: string) => {
        const displayName = name || user.email || 'User'
        return displayName.split(' ').map((n: String) => n[0]).join('').substring(0, 2).toUpperCase()
    }

    const getAvatarColor = (name: string) => {
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500']
        const charCodeSum = (name || user.email || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        return colors[charCodeSum % colors.length]
    }

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill('')
        }
    }
    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        // Client-Side Validation for Skills
        if (skills.length === 0) {
            setMessage({ type: 'error', text: 'Please add at least one skill.' })
            setLoading(false)
            return
        }

        formData.append('skills', JSON.stringify(skills))

        const result = await updateProfileWithCoupon(formData)

        if (result.success) {
            setMessage({ type: 'success', text: result.message })
            router.refresh()
        } else {
            setMessage({ type: 'error', text: result.message })
        }
        setLoading(false)
    }

    const displayName = profile?.full_name || user.email?.split('@')[0]

    return (
        <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="h-16 bg-slate-50"> </div>
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

            <form action={handleSubmit} className="space-y-6">
                
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-600" /> Personal Information
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModernInput label="Full Name" name="fullName" defaultValue={profile?.full_name} placeholder="John Doe" required />
                        <ModernInput label="Username" name="username" defaultValue={profile?.username} placeholder="johndoe" required />
                        <ModernInput label="Phone Number" name="phone" defaultValue={profile?.phone} icon={Phone} placeholder="+1 (555) 000-0000" required />
                        <ModernInput label="Location" name="location" defaultValue={profile?.location} icon={MapPin} placeholder="San Francisco, CA" required />
                        <div className="md:col-span-2">
                            <ModernInput label="Website / Portfolio" name="website" defaultValue={profile?.website} icon={Globe} placeholder="https://yourportfolio.com" />
                        </div>
                    </div>
                </div>

                {/* Referral Code Section */}
                <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                    <div className="border-b border-indigo-50 bg-indigo-50/30 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-indigo-600" />
                            Referral & Access Code
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="max-w-md">
                            <ModernInput 
                                label="College Coordinator Code" 
                                name="couponCode" 
                                icon={Ticket} 
                                defaultValue={profile?.referred_by} 
                                placeholder="Enter code (e.g. INTRAA-2025)"
                                disabled={!!profile?.referred_by}
                            />
                            {profile?.referred_by ? (
                                <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                    ✓ Code redeemed successfully
                                </p>
                            ) : (
                                <p className="mt-2 text-xs text-slate-500">
                                    Enter your unique code to unlock premium college features.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-indigo-600" /> Professional Details
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModernInput label="Target Role" name="targetRole" defaultValue={profile?.target_role} placeholder="Software Engineer" required />
                        <ModernInput label="Preferred Industry" name="preferredIndustry" defaultValue={profile?.preferred_industry} placeholder="Fintech, HealthTech" required />
                        <div className="md:col-span-2">
                            <ModernInput label="LeetCode Username" name="leetcodeUsername" defaultValue={profile?.leetcode_username} icon={Code} placeholder="shubham_dev" />
                        </div>
                        
                        {/* Skills UI */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex">
                                Skills <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                                    className="block w-full text-slate-900 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Add skill..."
                                />
                                <button onClick={handleAddSkill} type="button" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-400 hover:text-indigo-600"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                            {skills.length === 0 && <p className="text-xs text-red-500">At least one skill is required.</p>}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    {message && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>}
                    <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700 disabled:opacity-70 transition-all">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    )
}