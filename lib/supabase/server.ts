import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  
  // Extract slug/subdomain for cookie isolation
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : 'main'
  const cookieName = `sb-${slug}-auth-token`

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Handled by middleware
          }
        },
      },
      cookieOptions: {
        name: cookieName,
      }
    }
  )
}
