import { createClient } from '@/lib/supabase/server'
import { TenantsClient } from './TenantsClient'

export default async function OwnerTenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user?.id).single()

  // Get current building from slug
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : null

  const { data: currentBuilding } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  // Fetch available rooms for the integrated tenant/lease modal for THIS building only
  const { data: availableRooms } = await supabase
    .from('rooms')
    .select('id, room_number, rent_amount')
    .eq('building_id', currentBuilding?.id)
    .eq('status', 'available')

  const roomsList = availableRooms?.map(r => ({
    id: r.id,
    room_number: r.room_number,
    building_name: currentBuilding?.name || 'Unknown',
    rent: Number(r.rent_amount)
  })) || []

  // Fetch tenants who have leases in this specific building
  const { data: buildingLeases } = await supabase
    .from('leases')
    .select('id, tenant_id, rooms!inner(building_id)')
    .eq('rooms.building_id', currentBuilding?.id)
    .eq('status', 'active')
  
  const leaseMap = new Map((buildingLeases || []).map(l => [l.tenant_id, l.id]))
  const tenantIds = Array.from(leaseMap.keys())

  const { data: tenantsResult } = await supabase
    .from('tenants')
    .select('*')
    .in('id', tenantIds)
    .order('full_name', { ascending: true })

  const tenants = tenantsResult?.map(t => ({
    ...t,
    active_lease_id: leaseMap.get(t.id)
  })) || []

  return <TenantsClient tenants={tenants} roomsList={roomsList} />
}
