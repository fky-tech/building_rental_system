import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/sms-status
 * AfroMessage delivery status webhook.
 * AfroMessage will POST delivery info here after attempting delivery.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[sms-status] Callback received:', JSON.stringify(body))

    // AfroMessage callback payload fields (adjust if API differs)
    const {
      to,               // recipient phone number
      status,           // e.g. "delivered", "failed", "rejected"
      message_id,       // UUID from AfroMessage
      error,            // error description if failed
    } = body

    if (!to) {
      return NextResponse.json({ ok: false, error: 'Missing `to` field' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Map AfroMessage delivery status → our status
    let mappedStatus: 'sent' | 'failed' = 'sent'
    if (
      String(status).toLowerCase().includes('fail') ||
      String(status).toLowerCase().includes('reject') ||
      String(status).toLowerCase().includes('error')
    ) {
      mappedStatus = 'failed'
    }

    // Update the most recent pending/sent message for this recipient
    const { error: updateErr } = await supabase
      .from('messages')
      .update({
        status: mappedStatus,
        error: error || null,
      })
      .eq('phone', to)
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (updateErr) {
      console.error('[sms-status] DB update error:', updateErr)
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[sms-status] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
