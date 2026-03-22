import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const url = new URL(request.url)
  const host = request.headers.get('host') || url.host
  const protocol = request.url.startsWith('https') ? 'https' : 'http'
  
  return NextResponse.redirect(`${protocol}://${host}/login`)
}
