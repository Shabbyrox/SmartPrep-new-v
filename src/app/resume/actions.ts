// src/app/resume/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function saveResume(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const education = formData.get('education') as string
    const experience = formData.get('experience') as string
    const skills = formData.get('skills') as string

    const content = {
        fullName,
        email,
        education,
        experience,
        skills,
    }

    const { error } = await supabase.from('resumes').insert({
        title,
        content,
    })

    if (error) {
        console.error('Error saving resume:', error)
        return { error: error.message }
    }

    revalidatePath('/resume')
    redirect('/resume')
}
