import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the SERVICE ROLE key.
 * Only use this in server-side code (API routes, server actions).
 * This bypasses RLS – never expose to the client.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false }
  })
}
