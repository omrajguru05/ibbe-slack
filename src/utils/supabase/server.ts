import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        'https://ucqdglygojafgwtqmgdw.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcWRnbHlnb2phZmd3dHFtZ2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODczNTYsImV4cCI6MjA3OTI2MzM1Nn0.T9Kdi7ZkvSE0unwbJdAfB187DgoO3eJTDp4pTJbGIBE',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
