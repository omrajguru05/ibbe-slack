import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables are missing. Using placeholder values for build-time rendering.')
    }

    return createBrowserClient(
        supabaseUrl || 'http://localhost',
        supabaseAnonKey || 'public-anon-key',
    )
}
