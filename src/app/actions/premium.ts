// src/app/actions/premium.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache' // 👈 1. Import this

export async function joinWaitlist() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('premium_waitlist')
        .insert({ user_id: user.id })

    if (error && error.code !== '23505') {
        console.error('Waitlist error:', error)
        return { error: 'Failed to join' }
    }

    // 👇 2. Add this line! 
    // It tells Next.js: "The premium page changed, please refresh data next time."
    revalidatePath('/premium') 

    return { success: true }
}