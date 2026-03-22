import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  // Update session and get user
  const { supabaseResponse, user, supabase } = await updateSession(request)
  
  const url = request.nextUrl
  const hostname = request.headers.get("host") || request.nextUrl.hostname

  const isLocalEnv = hostname.includes('localhost')
  
  let currentHost = hostname.split(':')[0]
  let slug = null;
  
  // Extract subdomain slug
  if (isLocalEnv && currentHost.endsWith('.localhost')) {
      slug = currentHost.replace('.localhost', '')
  } else if (!isLocalEnv) {
      const parts = currentHost.split('.')
      // if domain is yourapp.com, parts.length == 2
      // if tenant.yourapp.com, parts.length == 3
      if (parts.length >= 3) {
          slug = parts[0]
      }
      if (slug === 'www' || slug === 'admin') {
          slug = null;
      }
  }

  const path = url.pathname;
  
  // Auth Protection & Role Access Control
  if (path.startsWith('/admin') || path.startsWith('/owner')) {
     if (!user) {
         const redirectRes = NextResponse.redirect(new URL('/login', request.url))
         supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
         return redirectRes
     }

     // Check role for cross-access
     const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
     
     if (path.startsWith('/admin') && profile?.role !== 'admin') {
         const redirectRes = NextResponse.redirect(new URL('/owner', request.url))
         supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
         return redirectRes
     }

     if (path.startsWith('/owner') && profile?.role === 'admin') {
         // Optionally allow admins into owner portal, but usually they have their own /admin view
         // For now, let's keep them in /admin
         const redirectRes = NextResponse.redirect(new URL('/admin', request.url))
         supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
         return redirectRes
     }
  }
  
  if (path === '/login' && user) {
     const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
     const dashboard = profile?.role === 'admin' ? '/admin' : '/owner'

     const redirectRes = NextResponse.redirect(new URL(dashboard, request.url))
     supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
     return redirectRes
  }

  // Handle Subdomain Rewrite & Isolation
  if (slug) {
      // 1. Check building AND owner status
      const { data: building } = await supabase
          .from('buildings')
          .select('status, owners!inner(status)')
          .eq('slug', slug)
          .single()

      if (building && (building.status !== 'active' || (building.owners as any)?.status !== 'active')) {
          return NextResponse.rewrite(new URL('/not-working', request.url))
      }

      // 2. Redirect root slug.localhost to /login if not authenticated (as specifically requested)
      if (path === '/' && !user) {
          const redirectRes = NextResponse.redirect(new URL('/login', request.url))
          // Copy cookies from updateSession response to ensure session is maintained
          supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
          return redirectRes
      }

      const reservedPaths = ['/owner', '/admin', '/login', '/api', '/_next', '/auth', '/favicon.ico', '/not-working'];
      const isReserved = reservedPaths.some(p => path.startsWith(p));

      if (!isReserved) {
          const rwUrl = new URL(`/${slug}${path === '/' ? '' : path}`, request.url)
          const rewriteRes = NextResponse.rewrite(rwUrl)
          // Copy cookies from updateSession response
          supabaseResponse.cookies.getAll().forEach(cookie => {
              rewriteRes.cookies.set(cookie.name, cookie.value, cookie as any)
          })
          return rewriteRes
      }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
