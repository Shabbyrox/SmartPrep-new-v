// src/app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()

    console.log('Attempting login for:', email)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    console.log('Login successful, redirecting to /dashboard')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()

    console.log('Attempting signup for:', email)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Signup error:', error.message)
        redirect('/error?message=' + encodeURIComponent(error.message))
    }

    if (data.user && !data.session) {
        console.log('Signup successful but no session (email confirmation likely required)')
        redirect('/auth/verify-email')
    }

    console.log('Signup successful, redirecting to /dashboard')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
