import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        'https://ucqdglygojafgwtqmgdw.supabase.co',
        'sb_publishable_ezk0RdOag2LhvhdE5sW-vw_vzc9nZww'
    )
}
