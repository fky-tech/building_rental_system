import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { OwnersClient } from './OwnersClient'

export default async function OwnersPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: owners } = await supabase
    .from('owners')
    .select('id, user_id, status, created_at, profiles!inner(full_name, phone)')
    .order('created_at', { ascending: false })

  // Fetch all auth users to map emails (required since email isn't in profiles table directly)
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  const emailMap = new Map(users?.map(u => [u.id, u.email]) || [])

  // Map the flattened data for the table
  const formattedOwners = owners?.map(owner => ({
    id: owner.id,
    user_id: owner.user_id,
    status: owner.status,
    created_at: owner.created_at,
    // @ts-ignore
    full_name: owner.profiles?.full_name || 'Unknown',
    // @ts-ignore
    phone: owner.profiles?.phone || '',
    email: emailMap.get(owner.user_id) || 'No Email'
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Owners Management</h1>
        {/* We will handle "Add Owner" in the Client Component with a modal/form state */}
      </div>

      <OwnersClient initialOwners={formattedOwners} />
    </div>
  )
}
