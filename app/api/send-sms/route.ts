import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const AFRO_API = 'https://api.afromessage.com/api/send'
const RATE_LIMIT_MS = 2000
const MAX_RETRIES = 3

// Wait utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function sendSingleToAfroMessage(
  payload: any,
  retries = 0
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  const token = process.env.AFRO_TOKEN
  if (!token) return { success: false, error: 'AFRO_TOKEN not configured' }

  let res: Response
  try {
    res = await fetch(AFRO_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err: any) {
    return { success: false, error: `Network error: ${err.message}` }
  }

  let body: any
  try {
    body = await res.json()
  } catch {
    body = {}
  }

  // Rate-limit response – retry after delay
  if (res.status === 429 && retries < MAX_RETRIES) {
    await delay(RATE_LIMIT_MS * (retries + 1))
    return sendSingleToAfroMessage(payload, retries + 1)
  }

  // AfroMessage success format
  if (body?.acknowledge === 'success') {
    return {
      success: true,
      message_id: body.response?.message_id,
    }
  }

  // AfroMessage error format
  const afroError =
    body?.response?.errors?.join(', ') ||
    body?.message ||
    `HTTP ${res.status}`

  return { success: false, error: afroError }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required array field: messages' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Insert pending message records
    const dbPayload = messages.map((msg: any) => ({
      tenant_id: msg.tenant_id || null,
      phone: msg.to,
      message: msg.message,
      status: 'pending',
    }))

    const { data: insertedRecords, error: insertErr } = await supabase
      .from('messages')
      .insert(dbPayload)
      .select('id')

    if (insertErr) {
      console.error('[send-sms] DB insert failed:', insertErr)
      // Continue even if logging fails – still try to send
    }

    const results = []

    // 2. Process messages individually with a 2-second delay
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      
      const afroPayload = {
        // from: process.env.IDENTIFIER_ID || '1234',
        sender: 'Kefiya Mgmt',
        to: msg.to,
        message: msg.message,
        callback: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/sms-status`
      }

      const resResult = await sendSingleToAfroMessage(afroPayload)
      
      // 3. Update individual db record if we inserted them successfully
      if (insertedRecords && insertedRecords[i]) {
        await supabase
          .from('messages')
          .update({
            status: resResult.success ? 'sent' : 'failed',
            error: resResult.error || null,
          })
          .eq('id', insertedRecords[i].id)
      }

      results.push({ ...resResult, phone: msg.to })

      // Apply 2-second delay between requests (skip after the last one)
      if (i < messages.length - 1) {
        await delay(RATE_LIMIT_MS)
      }
    }

    const allSuccess = results.every(r => r.success)

    if (!allSuccess) {
      console.error('[send-sms] Some or all messages failed:', results.filter(r => !r.success))
      // Return 207 Multi-Status or 200 depending on behavior desired.
      // E.g. we'll just return true with results to indicate we finished processing
    }

    return NextResponse.json({ success: allSuccess, results })
  } catch (err: any) {
    console.error('[send-sms] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
