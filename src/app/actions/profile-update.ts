// src/app/actions/profile-update.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileWithCoupon(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, message: 'Not authenticated' }

    // --- 1. SERVER-SIDE VALIDATION ---
    const fullName = formData.get('fullName') as string
    const username = formData.get('username') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string
    const targetRole = formData.get('targetRole') as string
    const preferredIndustry = formData.get('preferredIndustry') as string
    
    // Parse Skills
    const skillsString = formData.get('skills') as string
    let skills: string[] = []
    if (skillsString) {
        try {
            skills = JSON.parse(skillsString)
        } catch (e) {
            skills = []
        }
    }

    // Check for empty required fields
    if (!fullName?.trim()) return { success: false, message: 'Full Name is required.' }
    if (!username?.trim()) return { success: false, message: 'Username is required.' }
    if (!phone?.trim()) return { success: false, message: 'Phone number is required.' }
    if (!location?.trim()) return { success: false, message: 'Location is required.' }
    if (!targetRole?.trim()) return { success: false, message: 'Target Role is required.' }
    if (!preferredIndustry?.trim()) return { success: false, message: 'Preferred Industry is required.' }
    
    // Enforce at least 1 skill
    if (!skills || skills.length === 0) {
        return { success: false, message: 'Please add at least one skill.' }
    }

    // --- 2. CHECK USERNAME UNIQUENESS ---
    // Check if any OTHER user has this username
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('id', user.id) // Exclude current user (it's okay if I keep my own username)
        .single()

    if (existingUser) {
        return { success: false, message: 'Username is already taken. Please choose another.' }
    }

    // --- PREPARE UPDATES ---
    const updates: any = {
        full_name: fullName,
        username: username.trim(),
        website: formData.get('website'),
        phone: phone,
        location: location,
        target_role: targetRole,
        preferred_industry: preferredIndustry,
        leetcode_username: formData.get('leetcodeUsername'),
        skills: skills,
        updated_at: new Date().toISOString(),
    }

    // --- COUPON LOGIC ---
    const couponCode = formData.get('couponCode') as string

    if (couponCode && couponCode.trim() !== '') {
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('referred_by')
            .eq('id', user.id)
            .single()

        if (currentProfile?.referred_by) {
            return { success: false, message: 'You have already redeemed a coupon code.' }
        }

        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('code, usage_count')
            .eq('code', couponCode.trim())
            .single()

        if (!coupon || couponError) {
            return { success: false, message: 'Invalid coupon code.' }
        }

        await supabase.from('coupons').update({ usage_count: coupon.usage_count + 1 }).eq('code', coupon.code)
        updates.referred_by = coupon.code
    }

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...updates })

    if (error) {
        console.error(error)
        return { success: false, message: 'Failed to update profile.' }
    }

    revalidatePath('/profile')
    return { success: true, message: 'Profile updated successfully!' }
}