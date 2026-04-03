/**
 * Client-safe SMS helper.
 * POSTs to /api/send-sms – never exposes AFRO_TOKEN.
 */
export async function sendBulkSMS(
  messages: Array<{ to: string; message: string; tenant_id?: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'SMS failed' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' }
  }
}

export async function sendSMS(
  to: string,
  message: string,
  tenant_id: string
): Promise<{ success: boolean; error?: string }> {
  return sendBulkSMS([{ to, message, tenant_id }])
}

/**
 * Build the Amharic reminder message for a tenant.
 */
export function buildAmharicMessage(
  tenantName: string,
  roomType: string,
  amount: number,
  dateLabel: string
): string {
  // Localise room type to Amharic display label
  const roomTypeAm: Record<string, string> = {
    shop: 'ሱቅ',
    office: 'ቢሮ',
    single: 'ነጠላ ክፍል',
    double: 'ድርብ ክፍል',
    studio: 'ስቱዲዮ',
    apartment: 'አፓርትመንት',
  }
  const roomLabel = roomTypeAm[roomType?.toLowerCase()] || roomType || 'ክፍል'

  return (
    `ውድ ${tenantName}፣ የ${roomLabel} ክፍያዎ ${amount} ዛሬ (${dateLabel}) እንደሚከፈል እናሳስባለን።\n` +
    `እባክዎ ክፍያዎን በጊዜው ያከናውኑ እናመሰግናለን።`
  )
}

/**
 * Build the Amharic reminder message for an owner.
 */
export function buildOwnerAmharicMessage(
  ownerName: string,
  tenantName: string,
  tenantPhone: string,
  roomInfo: string,
  amount: number,
  dateLabel: string
): string {
  return `ውድ ${ownerName}፣ አስታዋሽ፡ ተከራይ ${tenantName} (${tenantPhone}) የ${roomInfo} ክፍያ ${amount} ብር ዛሬ (${dateLabel}) መክፈል አለበት።`
}
