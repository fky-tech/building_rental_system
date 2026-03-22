'use client'

import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfileAction, updatePasswordAction } from './actions'
import { CheckCircle, AlertCircle } from 'lucide-react'

type Profile = {
  full_name: string
  phone: string | null
  id: string
}

export function SettingsForms({ profile, email }: { profile: Profile, email: string }) {
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfileAction(null, formData)

    if (result.success) {
      setProfileMessage({ type: 'success', text: result.message || 'Profile updated successfully' })
    } else {
      setProfileMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }
    setProfileLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setPasswordLoading(true)
    setPasswordMessage(null)

    const formData = new FormData(form)
    const result = await updatePasswordAction(null, formData)

    if (result.success) {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully. Signing you out in 2 seconds...' })
      form.reset()
      
      // Sign out after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/signout'
      }, 2000)
    } else {
      setPasswordMessage({ type: 'error', text: result.error || 'Failed to update password' })
    }
    setPasswordLoading(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader title="Profile Settings" subtitle="Update your personal information" />
        <form onSubmit={handleProfileSubmit} className="space-y-4 p-6 pt-0">
          {profileMessage && (
            <div className={`p-3 rounded-md border flex items-center ${profileMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              <span className="text-sm">{profileMessage.text}</span>
            </div>
          )}
          <Input label="Full Name" name="full_name" defaultValue={profile.full_name} required />
          <Input label="Email" name="email" type="email" defaultValue={email} required />
          <Input label="Phone Number" name="phone" defaultValue={profile.phone || ''} placeholder="+251 ..." />
          <Button type="submit" variant="primary" disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Change your password" />
        <form onSubmit={handlePasswordSubmit} className="space-y-4 p-6 pt-0">
          {passwordMessage && (
            <div className={`p-3 rounded-md border flex items-center ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              <span className="text-sm">{passwordMessage.text}</span>
            </div>
          )}
          <Input label="New Password" name="password" type="password" required />
          <Input label="Confirm New Password" name="confirmPassword" type="password" required />
          <Button type="submit" variant="outline" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
