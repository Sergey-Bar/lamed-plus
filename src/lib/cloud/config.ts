/**
 * The app stays fully usable without a backend. Cloud features switch on only
 * when the build has a Supabase project configured.
 */
const url = String((import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ?? '').trim()
const anonKey = String((import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ?? '').trim()

export const CLOUD_URL = url
export const CLOUD_ANON_KEY = anonKey
export const CLOUD_ENABLED = url.length > 0 && anonKey.length > 0
