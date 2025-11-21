import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        'https://ucqdglygojafgwtqmgdw.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcWRnbHlnb2phZmd3dHFtZ2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODczNTYsImV4cCI6MjA3OTI2MzM1Nn0.T9Kdi7ZkvSE0unwbJdAfB187DgoO3eJTDp4pTJbGIBE'
    )
}
