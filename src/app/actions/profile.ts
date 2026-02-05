// src/app/actions/profile.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeetCodeUsername(username: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Unauthorized' }
    if (!username.trim()) return { success: false, message: 'Username cannot be empty' }

    try {
        // 1. Verify if user exists on LeetCode (Optional check)
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query getUser($username: String!) { matchedUser(username: $username) { username } }`,
                variables: { username }
            }),
            cache: 'no-store'
        })

        const data = await response.json()
        if (!data.data?.matchedUser) {
            return { success: false, message: 'LeetCode username not found.' }
        }

        // 2. Save to Supabase
        const { error } = await supabase
            .from('profiles')
            .update({ leetcode_username: username })
            .eq('id', user.id)

        if (error) throw error

        revalidatePath('/dashboard')
        revalidatePath('/coding', 'layout') // Also refresh coding arena
        return { success: true, message: 'Connected successfully!' }

    } catch (error) {
        console.error(error)
        return { success: false, message: 'Failed to connect. Try again.' }
    }
}