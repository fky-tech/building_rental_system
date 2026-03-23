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

     const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
     
     if (path.startsWith('/admin') && profile?.role !== 'admin') {
         const redirectRes = NextResponse.redirect(new URL('/owner', request.url))
         supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
         return redirectRes
     }

     if (path.startsWith('/owner') && profile?.role === 'admin') {
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

  // Handle Subdomain Security & Rewrites
  if (slug) {
      const normalizedSlug = slug.toLowerCase().trim()
      
      // 1. Reserved subdomains (admin, www) skip building check
      if (normalizedSlug !== 'admin' && normalizedSlug !== 'www') {
           // Use service role to bypass RLS for slug validation
           const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
           const adminSupabase = createSupabaseClient(
               process.env.NEXT_PUBLIC_SUPABASE_URL!,
               process.env.SUPABASE_SERVICE_ROLE_KEY!
           )

           const { data: buildings } = await adminSupabase
               .from('buildings')
               .select('status, owners(status)')
               .eq('slug', normalizedSlug)
               .limit(1)

           const buildingData = buildings && buildings.length > 0 ? buildings[0] : null

           if (!buildingData) {
               // Hard 404 for unauthorized subdomains (e.g. owner names)
               return new NextResponse("404 Not Found", { status: 404 })
           }

           const isBuildingActive = buildingData.status === 'active'
           const isOwnerActive = (buildingData.owners as any)?.[0]?.status === 'active'
             || (buildingData.owners as any)?.status === 'active'

           if (!isBuildingActive || !isOwnerActive) {
               return NextResponse.rewrite(new URL('/not-working', request.url))
           }
      }

      // 2. Redirect root slug.localhost/ to /login if not authenticated
      if (path === '/' && !user) {
          const redirectRes = NextResponse.redirect(new URL('/login', request.url))
          supabaseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c))
          return redirectRes
      }

      // 3. Rewrite building subdomain traffic to the tenant folder
      const reservedPaths = ['/owner', '/admin', '/login', '/api', '/_next', '/auth', '/favicon.ico', '/not-working'];
      const isReserved = reservedPaths.some(p => path.startsWith(p));

      if (!isReserved) {
          const rwUrl = new URL(`/${slug}${path === '/' ? '' : path}`, request.url)
          const rewriteRes = NextResponse.rewrite(rwUrl)
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
