import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForms } from './SettingsForms'

export default async function OwnerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div>Error loading profile</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 px-4">Account Settings</h1>
      <SettingsForms profile={profile} email={user.email || ''} />
    </div>
  )
}
