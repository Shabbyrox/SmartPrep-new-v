// src/app/resume/builder/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { ResumeData } from '@/types/resume'

// Save (Upsert) the Resume JSON
export async function saveResume(data: ResumeData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'You must be logged in to save.' }

    try {
        // Check if user already has a resume row
        const { data: existing } = await supabase
            .from('resumes')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('resumes')
                .update({ 
                    content: data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
            
            if (error) throw error
        } else {
            // Insert new
            const { error } = await supabase
                .from('resumes')
                .insert({
                    user_id: user.id,
                    title: 'My Resume',
                    content: data,
                    updated_at: new Date().toISOString()
                })
            
            if (error) throw error
        }

        return { success: true }
    } catch (error: any) {
        console.error('Save Error:', error)
        return { error: 'Failed to save resume draft.' }
    }
}

// Load the Resume JSON
export async function loadResume() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('resumes')
        .select('content')
        .eq('user_id', user.id)
        .single()

    return data?.content as ResumeData || null
}