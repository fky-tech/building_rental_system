'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { UserCog, CheckCircle, X, Clock } from 'lucide-react'
import { updateTenantAction, endLeaseAction, updateLeaseDueAction } from './actions'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export function EditTenantModal({ tenant }: { tenant: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dueLoading, setDueLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dueError, setDueError] = useState<string | null>(null)
  const [dueSuccess, setDueSuccess] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()

  // Local state for due day + time inline editing
  const [dueDay, setDueDay] = useState<number>(tenant.lease_due_day ?? 5)
  const [dueTime, setDueTime] = useState<string>(
    tenant.lease_due_time
      ? String(tenant.lease_due_time).slice(0, 5)   // trim seconds
      : '09:00'
  )

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setError(null)
      setDueError(null)
      setDueSuccess(false)
      setLoading(false)
      setSuccess(false)
    }, 200)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('id', tenant.id)
    
    const result = await updateTenantAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || t('common.error'))
      setLoading(false)
    }
  }

  const handleUpdateDue = async () => {
    if (!tenant.active_lease_id) return
    setDueLoading(true)
    setDueError(null)
    setDueSuccess(false)

    const result = await updateLeaseDueAction(tenant.active_lease_id, dueDay, dueTime)

    if (result.success) {
      setDueSuccess(true)
      router.refresh()
    } else {
      setDueError(result.error || t('common.error'))
    }
    setDueLoading(false)
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900" onClick={() => setOpen(true)}>
          <UserCog className="w-4 h-4 mr-2" /> {t('tenants.manage')}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto text-left">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative my-8">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? t('tenants.manage_success') : t('tenants.manage_title')}
               </h2>
               <button onClick={handleClose} type="button" className="text-gray-400 hover:text-gray-500">
                 <X className="h-6 w-6" />
               </button>
            </div>
             
            {success ? (
               <div className="space-y-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                       <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-gray-600">{t('tenants.updated')}</p>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                      <Button variant="primary" onClick={handleClose}>{t('tenants.done')}</Button>
                  </div>
               </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
                      {error}
                    </div>
                  )}
                  
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
                      {t('tenants.note_update')}
                  </p>

                  <div className="space-y-4">
                      <div>
                          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.full_name')}</label>
                          <input id="full_name" name="full_name" type="text" required defaultValue={tenant.full_name} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      
                      <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.phone_number')}</label>
                          <input id="phone" name="phone" type="text" defaultValue={tenant.phone || ''} placeholder="+251 ..." className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                      </div>

                      <div>
                          <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.id_passport')}</label>
                          <input id="id_number" name="id_number" type="text" defaultValue={tenant.id_number || ''} placeholder="ID-12345" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                      </div>

                      <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.notes')}</label>
                          <textarea id="notes" name="notes" rows={2} defaultValue={tenant.notes || ''} placeholder={t('tenants.notes_placeholder')} className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
                      </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100">
                      <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>{t('tenants.cancel')}</Button>
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? t('tenants.saving') : t('tenants.save')}
                      </Button>
                  </div>
                </form>

                {/* Rent Due Day & Time – only shown when there's an active lease */}
                {tenant.active_lease_id && (
                  <div className="pt-4 border-t border-blue-100 mt-2">
                    <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {t('tenants.update_due')}
                    </h3>

                    {dueError && (
                      <div className="p-2 mb-3 bg-red-50 text-red-800 text-xs rounded border border-red-100">
                        {dueError}
                      </div>
                    )}
                    {dueSuccess && (
                      <div className="p-2 mb-3 bg-green-50 text-green-800 text-xs rounded border border-green-100 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> {t('tenants.due_updated')}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('tenants.due_day')}</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={dueDay}
                          onChange={e => setDueDay(Number(e.target.value))}
                          className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('tenants.due_time')}</label>
                        <input
                          type="time"
                          value={dueTime}
                          onChange={e => setDueTime(e.target.value)}
                          className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={dueLoading}
                      onClick={handleUpdateDue}
                    >
                      {dueLoading ? t('tenants.saving') : t('tenants.update_due_btn')}
                    </Button>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 mt-6 text-left">
                   <h3 className="text-sm font-bold text-red-600 mb-4 uppercase tracking-wider">{t('tenants.danger_zone')}</h3>
                   <div className="space-y-3">
                      {tenant.active_lease_id && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                           <div className="text-xs">
                              <p className="font-bold text-orange-900">{t('tenants.active_lease')}</p>
                              <p className="text-orange-700">{t('tenants.end_lease_desc')}</p>
                           </div>
                           <Button 
                             type="button" 
                             variant="outline" 
                             size="sm" 
                             className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                             onClick={async () => {
                               if (confirm(t('tenants.confirm_end_lease'))) {
                                 setLoading(true)
                                 const res = await endLeaseAction(tenant.active_lease_id)
                                 if (res.success) {
                                   setSuccess(true)
                                 } else {
                                   setError(res.error)
                                 }
                                 setLoading(false)
                                 router.refresh()
                               }
                             }}
                             disabled={loading}
                           >
                             {t('tenants.end_lease')}
                           </Button>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
