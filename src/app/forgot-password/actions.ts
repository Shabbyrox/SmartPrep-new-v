// src/app/forgot-password/actions.ts 
'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOTPEmail } from '@/lib/email'

// --- 1. REQUEST RESET CODE ---
export async function forgotPasswordAction(formData: FormData) {
    const email = (formData.get('email') as string).trim()
    const supabase = createAdminClient()

    // 1. Check if user exists
    // We use listUsers() to check without exposing info, but for UX we tell them if it's wrong.
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const user = users.users.find(u => u.email === email)

    if (!user) {
        return { error: "We couldn't find an account with that email." }
    }

    const providers = user.app_metadata.providers || []
    if (providers.includes('google') && !providers.includes('email')) {
        return { error: "You signed up with Google. Please log in with the Google button." }
    }

    // 2. Generate Code
    // Clean up any old reset codes for this email first so they don't stack up
    await supabase.from('verification_codes').delete().eq('email', email).eq('type', 'reset')

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry

    // 3. Save Code
    const { error: dbError } = await supabase.from('verification_codes').insert({
        email, 
        code, 
        type: 'reset', 
        expires_at: expiresAt.toISOString()
    })

    if (dbError) return { error: "System error generating code." }

    // 4. Send Email
    const sent = await sendOTPEmail(email, code, 'reset')
    if (!sent) return { error: "Failed to send email. Please try again." }

    redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`)
}

// --- 2. UPDATE PASSWORD ---
export async function resetPasswordAction(formData: FormData) {
    const email = (formData.get('email') as string).trim()
    const code = (formData.get('code') as string).trim()
    const password = (formData.get('password') as string).trim()
    const confirmPassword = (formData.get('confirmPassword') as string).trim()
    
    if (password !== confirmPassword) {
        return { error: "Passwords do not match." }
    }

    const supabase = createAdminClient()

    // 1. Verify Code
    const { data: record } = await supabase.from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', 'reset')
        .gt('expires_at', new Date().toISOString()) // Check if not expired
        .single()

    if (!record) {
        return { error: "Invalid or expired verification code." }
    }

    // 2. Find User ID
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
        return { error: "User account error." }
    }

    // 3. Update Password
    // We also auto-confirm their email (if they weren't verified yet) since they proved ownership via OTP
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { 
        password: password,
        email_confirm: true 
    })

    if (updateError) {
        return { error: "Failed to update password." }
    }

    // 4. Cleanup
    await supabase.from('verification_codes').delete().eq('id', record.id)

    redirect('/login?reset=true')
}