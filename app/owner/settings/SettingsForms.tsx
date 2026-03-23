'use client'

import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfileAction, updatePasswordAction } from './actions'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

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
  const { t } = useLanguage()

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfileAction(null, formData)

    if (result.success) {
      setProfileMessage({ type: 'success', text: result.message || t('settings.profile_success') })
    } else {
      setProfileMessage({ type: 'error', text: result.error || t('settings.profile_error') })
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
      setPasswordMessage({ type: 'success', text: t('settings.password_success') })
      form.reset()
      
      // Sign out after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/signout'
      }, 2000)
    } else {
      setPasswordMessage({ type: 'error', text: result.error || t('settings.password_error') })
    }
    setPasswordLoading(false)
  }

  return (
    <div className="space-y-6 max-w-3xl text-left">
      <Card>
        <CardHeader title={t('settings.profile_title')} subtitle={t('settings.profile_subtitle')} />
        <form onSubmit={handleProfileSubmit} className="space-y-4 p-6 pt-0">
          {profileMessage && (
            <div className={`p-3 rounded-md border flex items-center ${profileMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              <span className="text-sm">{profileMessage.text}</span>
            </div>
          )}
          <Input label={t('tenants.full_name')} name="full_name" defaultValue={profile.full_name} required className="text-left" />
          <Input label={t('tenants.email')} name="email" type="email" defaultValue={email} required className="text-left" />
          <Input label={t('tenants.phone')} name="phone" defaultValue={profile.phone || ''} placeholder="+251 ..." className="text-left" />
          <div className="flex justify-start">
            <Button type="submit" variant="primary" disabled={profileLoading}>
              {profileLoading ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={t('settings.security_title')} subtitle={t('settings.security_subtitle')} />
        <form onSubmit={handlePasswordSubmit} className="space-y-4 p-6 pt-0">
          {passwordMessage && (
            <div className={`p-3 rounded-md border flex items-center ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              <span className="text-sm">{passwordMessage.text}</span>
            </div>
          )}
          <Input label={t('settings.new_password')} name="password" type="password" required className="text-left" />
          <Input label={t('settings.confirm_password')} name="confirmPassword" type="password" required className="text-left" />
          <div className="flex justify-start">
            <Button type="submit" variant="outline" disabled={passwordLoading}>
              {passwordLoading ? t('settings.updating') : t('settings.update_password')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
