// src/app/api/interview/generate/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ratelimit } from '@/utils/ratelimit' // Import the file you made in Step 3
import { generateInterviewQuestion } from '@/app/interview/generate-interview-question' // Example import

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. CHECK RATE LIMIT
  // We use the User ID as the key, so limits are per-user
  const identifier = user.id
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    )
  }

  // 3. If success, continue with your expensive Gemini call
  try {
    // ... your existing logic here ...
    const body = await request.json()
    // const result = await geminiCall(...) 

    return NextResponse.json({ data: "Success" })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}