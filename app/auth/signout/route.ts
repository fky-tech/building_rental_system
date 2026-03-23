import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function handleSignOut(request: Request) {
  const url = new URL(request.url)
  const host = request.headers.get('host') || url.host
  const protocol = request.url.startsWith('https') ? 'https' : 'http'

  // Extract slug to identify which cookie to clear
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : 'main'
  const cookieName = `sb-${slug}-auth-token`

  const cookieStore = await cookies()

  // Create client scoped to THIS subdomain's cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // handled by middleware
          }
        },
      },
      cookieOptions: {
        name: cookieName,
      },
    }
  )

  // Sign out ONLY locally — scope:'local' clears local session without
  // invalidating tokens on other subdomains (other buildings).
  await supabase.auth.signOut({ scope: 'local' })

  const response = NextResponse.redirect(`${protocol}://${host}/login`)
  // Explicitly delete this building's session cookie from the response
  response.cookies.delete(cookieName)

  return response
}

export async function POST(request: Request) {
  return handleSignOut(request)
}

export async function GET(request: Request) {
  return handleSignOut(request)
}
