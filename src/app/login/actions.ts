// src/app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOTPEmail } from '@/lib/email'

// --- 1. STANDARD LOGIN ---
export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email address first.' }
    }
    return { error: 'Invalid login credentials' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// --- 2. CUSTOM SIGNUP ---
export async function signup(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()
  const confirmPassword = (formData.get('confirmPassword') as string).trim()
  const fullName = (formData.get('name') as string).trim()

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Check if user exists
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = users.users.find(u => u.email === email)
  
  // Edge Case A: User exists and is ALREADY verified.
  if (existingUser && existingUser.email_confirmed_at) {
    return { error: "User already exists. Please log in." }
  }

  // Edge Case B: User exists but is NOT verified (Abandoned signup).
  // We update their password/name and resend OTP.
  if (existingUser && !existingUser.email_confirmed_at) {
    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
       password: password,
       user_metadata: { full_name: fullName } 
    })
  } 
  
  // Normal Case: New User
  else {
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User cannot login yet
      user_metadata: { full_name: fullName }
    })

    if (createError) {
      return { error: createError.message }
    }
  }

  // Generate & Store OTP
  // First, delete any old codes for this email
  await supabaseAdmin.from('verification_codes').delete().eq('email', email)

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

  const { error: dbError } = await supabaseAdmin
    .from('verification_codes')
    .insert({
      email,
      code,
      type: 'signup',
      expires_at: expiresAt.toISOString()
    })

  if (dbError) return { error: "Failed to generate code." }

  // Send Email
  const emailSent = await sendOTPEmail(email, code, 'signup')
  if (!emailSent) return { error: "Failed to send email." }

  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`)
}

// --- 3. VERIFY OTP ---
export async function verifySignupOTP(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const email = (formData.get('email') as string).trim()
  const code = (formData.get('code') as string).trim()

  // Verify Code
  const { data: record } = await supabaseAdmin
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('type', 'signup')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!record) return { error: "Invalid or expired code." }

  // Find User
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)

  if (!user) return { error: "User record not found." }

  // ACTIVATE USER
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id, 
    { email_confirm: true }
  )

  if (updateError) return { error: "Failed to activate account." }

  // Cleanup
  await supabaseAdmin.from('verification_codes').delete().eq('id', record.id)

  redirect('/login?verified=true')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}