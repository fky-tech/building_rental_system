import { createClient } from '@/lib/supabase/server'
import { MessagesClient } from './MessagesClient'

export default async function OwnerMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownerRec } = await supabase
    .from('owners')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Get all tenant_ids that belong to this owner
  const { data: ownerTenants } = await supabase
    .from('tenants')
    .select('id, full_name')
    .eq('owner_id', ownerRec?.id)

  const tenantIds = ownerTenants?.map(t => t.id) || []
  const tenantNameMap = Object.fromEntries((ownerTenants || []).map(t => [t.id, t.full_name]))

  // Fetch messages for this owner's tenants (most recent first)
  const { data: messagesRaw } = tenantIds.length > 0
    ? await supabase
        .from('messages')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false })
        .limit(200)
    : { data: [] }

  const messages = (messagesRaw || []).map(m => ({
    ...m,
    tenant_name: m.tenant_id ? tenantNameMap[m.tenant_id] || 'Unknown' : 'Unknown',
  }))

  const totalSent   = messages.filter(m => m.status === 'sent').length
  const totalFailed = messages.filter(m => m.status === 'failed').length
  const totalPending = messages.filter(m => m.status === 'pending').length

  return (
    <MessagesClient
      messages={messages}
      totalSent={totalSent}
      totalFailed={totalFailed}
      totalPending={totalPending}
    />
  )
}
