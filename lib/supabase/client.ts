import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const host = typeof window !== 'undefined' ? window.location.host : ''
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : 'main'
  const cookieName = `sb-${slug}-auth-token`

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: cookieName,
      }
    }
  )
}
