import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CLOUD_ANON_KEY, CLOUD_ENABLED, CLOUD_URL } from './config'

let client: SupabaseClient | null = null

/** A single browser client, created lazily so guest-only builds never load it twice. */
export function getCloud(): SupabaseClient | null {
  if (!CLOUD_ENABLED) return null
  client ??= createClient(CLOUD_URL, CLOUD_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // PKCE keeps the magic-link return on a normal query string, which the
      // hash router can ignore; the implicit flow would fight it.
      flowType: 'pkce',
      storageKey: 'lamed-auth',
    },
  })
  return client
}
