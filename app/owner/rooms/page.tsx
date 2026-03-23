import { createClient } from '@/lib/supabase/server'
import { RoomsClient } from './RoomsClient'
import { syncRoomStatusesAction } from './actions'

export default async function OwnerRoomsPage() {
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

  // Auto-sync room statuses: fix any orphaned 'occupied' rooms that have no active lease
  // This handles cases where tenants/leases were deleted directly from the database
  if (currentBuilding?.id) {
    await syncRoomStatusesAction(currentBuilding.id)
  }

  // Fetch rooms for the specific building (after sync to get correct statuses)
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, buildings!inner(name, owner_id)')
    .eq('building_id', currentBuilding?.id)
    .order('room_number', { ascending: true })

  return <RoomsClient rooms={rooms || []} currentBuilding={currentBuilding} />
}
