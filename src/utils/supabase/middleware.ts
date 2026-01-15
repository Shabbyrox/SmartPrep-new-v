// src/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // 1. Create the initial response
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 2. Initialize Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Get the User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 4. Define Protected Routes logic
    // You can customize this list or keep it broad
    const isExcludedPath = 
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/forgot-password')

    // 5. SECURITY CHECK
    if (!user && !isExcludedPath) {
        
        // 🔴 FIX: Check if the request is for an API route
        if (request.nextUrl.pathname.startsWith('/api')) {
            // For API routes, return a JSON 401 error
            return NextResponse.json(
                { error: 'Unauthorized: Please log in to access this resource.' },
                { status: 401 }
            )
        }

        // 🟡 For standard pages, redirect to Login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}