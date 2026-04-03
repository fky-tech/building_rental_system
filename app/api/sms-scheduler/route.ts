import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { gregorianToEthiopian, formatEthiopianDate } from '@/lib/ethiopian-calendar'
import { buildAmharicMessage, buildOwnerAmharicMessage } from '@/lib/utils/sendSMS'

const MAX_RETRIES = 2
const BATCH_SIZE = 50
const RATE_MS = 2000

export async function GET(req: NextRequest) {
  // --- Auth guard ---
  const authHeader = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const now = new Date()
  const eth = gregorianToEthiopian(now)
  const todayEthDay = eth.day
  const todayLabel = formatEthiopianDate(now, 'am')

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  console.log(
    `[sms-scheduler] ${now.toISOString()} | Eth day: ${todayEthDay}`
  )

  const freshResults: Array<{ phone: string; success: boolean; error?: string }> = []
  const retryResults: Array<{ id: string; phone: string; success: boolean; error?: string }> = []

  // ================================================================
  // PASS 1 – Send fresh reminders for leases due today
  // ================================================================
  const { data: leases, error: leaseErr } = await supabase
    .from('leases')
    .select(`
      id,
      monthly_rent,
      payment_due_day,
      tenant_id,
      tenants!inner ( full_name, phone ),
      rooms!inner ( room_type, floor_number, room_number, building_id )
    `)
    .eq('status', 'active')
    .eq('payment_due_day', todayEthDay)

  if (leaseErr) {
    console.error('[sms-scheduler] Lease query error:', leaseErr)
    return NextResponse.json({ error: leaseErr.message }, { status: 500 })
  }

  // ----------------------------------------------------------------
  // Prevent Duplicates: Fetch tenants who already received a message TODAY
  // ----------------------------------------------------------------
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  
  const { data: todaysMessages } = await supabase
    .from('messages')
    .select('tenant_id')
    .gte('created_at', startOfToday.toISOString())

  const messagedTenantsToday = new Set((todaysMessages || []).map((m: any) => m.tenant_id))

  // Optimize Owner Phone lookup
  const bIds = Array.from(new Set((leases ?? []).map((l: any) => l.rooms?.building_id).filter(Boolean)))
  let ownerPhoneMap: Record<string, string> = {}
  let ownerNameMap: Record<string, string> = {}
  
  if (bIds.length > 0) {
    const { data: ownersPhoneData } = await supabase
      .from('buildings')
      .select(`
        id,
        owners!inner (
          profiles!inner ( phone, full_name )
        )
      `)
      .in('id', bIds)

    ownersPhoneData?.forEach((b: any) => {
      const ownersObj = b.owners
      const profilesObj = Array.isArray(ownersObj) ? ownersObj[0]?.profiles : ownersObj?.profiles
      const oPhone = Array.isArray(profilesObj) ? profilesObj[0]?.phone : profilesObj?.phone
      const oName = Array.isArray(profilesObj) ? profilesObj[0]?.full_name : profilesObj?.full_name
      if (oPhone) ownerPhoneMap[b.id] = oPhone
      if (oName) ownerNameMap[b.id] = oName
    })
  }

  // Prepare all messages for Pass 1
  let freshMessagesPayload: Array<{ to: string; message: string; tenant_id: string }> = []

  for (const lease of leases ?? []) {
    if (messagedTenantsToday.has(lease.tenant_id)) continue

    const tenant = (lease as any).tenants
    const room = (lease as any).rooms
    const tenantPhone = tenant?.phone

    if (!tenantPhone) {
      freshResults.push({ phone: '', success: false, error: 'No tenant phone number' })
      continue
    }

    const roomTypeLabel = room?.room_type || 'ክፍል'
    const roomInfo = `${room?.floor_number != null ? `ወለል ${room.floor_number}, ` : ''}ክፍል ${room?.room_number || ''} ${roomTypeLabel}`

    // 1. Tenant Message
    const tMsg = buildAmharicMessage(tenant.full_name, roomTypeLabel, lease.monthly_rent, todayLabel)
    freshMessagesPayload.push({
      to: tenantPhone,
      message: tMsg,
      tenant_id: lease.tenant_id,
    })

    // 2. Owner Message
    const ownerPhone = ownerPhoneMap[room.building_id]
    if (ownerPhone) {
      const ownerName = ownerNameMap[room.building_id] || 'ቤት ባለቤት'
      const oMsg = buildOwnerAmharicMessage(
        ownerName,
        tenant.full_name,
        tenantPhone,
        roomInfo,
        lease.monthly_rent,
        todayLabel
      )
      freshMessagesPayload.push({
        to: ownerPhone,
        message: oMsg,
        tenant_id: lease.tenant_id,
      })
    }
  }

  // Chunk and send Pass 1 messages
  for (let i = 0; i < freshMessagesPayload.length; i += BATCH_SIZE) {
    const batch = freshMessagesPayload.slice(i, i + BATCH_SIZE)
    let batchSuccess = false
    let batchError: string | undefined

    try {
      const res = await fetch(`${baseUrl}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: batch }),
      })
      const data = await res.json()
      batchSuccess = data.success ?? false
      batchError = data.error
    } catch (err: any) {
      batchError = err.message
    }

    batch.forEach(msg => {
      freshResults.push({ phone: msg.to, success: batchSuccess, error: batchError })
      console.log(`[sms-scheduler] Fresh → ${msg.to}: ${batchSuccess ? 'OK' : batchError}`)
    })

    if (i + BATCH_SIZE < freshMessagesPayload.length) {
      await new Promise(r => setTimeout(r, RATE_MS))
    }
  }

  // ================================================================
  // PASS 2 – Retry failed messages from the last 24 hours
  // ================================================================
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const { data: failedMsgs, error: failedErr } = await supabase
    .from('messages')
    .select('id, phone, message, tenant_id, retry_count')
    .eq('status', 'failed')
    .lt('retry_count', MAX_RETRIES)
    .gte('created_at', since24h)

  if (failedErr) {
    console.error('[sms-scheduler] Retry query error:', failedErr)
  }

  // Prepare retry instances
  const retryMessagesPayload = failedMsgs ?? []

  for (let i = 0; i < retryMessagesPayload.length; i += BATCH_SIZE) {
    const batch = retryMessagesPayload.slice(i, i + BATCH_SIZE)
    let batchSuccess = false
    let batchError: string | undefined

    try {
      // Re-send via API – Note: This will create new records in `messages`.
      const res = await fetch(`${baseUrl}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: batch.map(m => ({ to: m.phone, message: m.message, tenant_id: m.tenant_id }))
        }),
      })
      const data = await res.json()
      batchSuccess = data.success ?? false
      batchError = data.error
    } catch (err: any) {
      batchError = err.message
    }

    // Update original retry_count for all messages in batch
    for (const msg of batch) {
      const incrementedRetryCount = (msg.retry_count ?? 0) + 1
      await supabase
        .from('messages')
        .update({
          retry_count: incrementedRetryCount,
          status: batchSuccess ? 'sent' : 'failed',
          error: batchSuccess ? null : batchError || msg.message,
        })
        .eq('id', msg.id)

      retryResults.push({ id: msg.id, phone: msg.phone, success: batchSuccess, error: batchError })
      console.log(`[sms-scheduler] Retry(${incrementedRetryCount}) → ${msg.phone}: ${batchSuccess ? 'OK' : batchError}`)
    }

    if (i + BATCH_SIZE < retryMessagesPayload.length) {
      await new Promise(r => setTimeout(r, RATE_MS))
    }
  }

  // ================================================================
  // Summary
  // ================================================================
  const freshSent = freshResults.filter(r => r.success).length
  const freshFailed = freshResults.filter(r => !r.success).length
  const retrySent = retryResults.filter(r => r.success).length
  const retryFailed = retryResults.filter(r => !r.success).length

  return NextResponse.json({
    fresh: { sent: freshSent, failed: freshFailed, total: freshResults.length },
    retry: { sent: retrySent, failed: retryFailed, total: retryResults.length },
    results: [...freshResults, ...retryResults],
  })
}

