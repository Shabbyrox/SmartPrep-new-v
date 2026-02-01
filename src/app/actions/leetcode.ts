// src/app/actions/leetcode.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifySubmission(questionId: string, questionSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Please log in first' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('leetcode_username')
        .eq('id', user.id)
        .single()

    const leetcodeUsername = profile?.leetcode_username

    if (!leetcodeUsername) {
        return { success: false, message: 'Please add your LeetCode username in your Profile first!' }
    }

    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `
                    query recentAcSubmissions($username: String!, $limit: Int!) {
                        recentAcSubmissionList(username: $username, limit: $limit) {
                            titleSlug
                        }
                    }
                `,
                variables: {
                    username: leetcodeUsername,
                    limit: 20 //  limit to check more history
                }
            }),
            cache: 'no-store'
        })

        const data = await response.json()
        const submissions = data.data?.recentAcSubmissionList || []

        // 👇 CHANGED: Removed the time check. 
        // We now just check if the slug exists in their recent history.
        const isSolved = submissions.find((sub: any) => sub.titleSlug === questionSlug)

        if (!isSolved) {
            // 👇 Updated Error Message to guide the user
            return { 
                success: false, 
                message: 'Not found in recent activity. If you solved this long ago, please Click "Submit" again on LeetCode, then click Verify here.' 
            }
        }

        // Success! Save to Database
        await supabase.from('user_leetcode_progress').upsert({
            user_id: user.id,
            question_id: questionId,
            status: 'solved',
            solved_at: new Date().toISOString()
        }, { onConflict: 'user_id, question_id' })

        revalidatePath('/coding')
        return { success: true, message: 'Verified! Great job.' }

    } catch (error) {
        console.error('Verification failed:', error)
        return { success: false, message: 'Could not connect to LeetCode.' }
    }
}