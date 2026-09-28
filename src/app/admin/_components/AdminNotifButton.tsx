'use client'

import { useState } from 'react'
import { Bell, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminNotifButton() {
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<number | null>(null)

  const handleSend = async () => {
    if (sending) return
    setSending(true)
    try {
      const res = await fetch('/api/cron/daily-notifications', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'خطأ في إرسال الإشعارات')
        return
      }
      toast.success(data.message || 'تم إرسال الإشعارات اليومية بنجاح')
      setLastSent(Date.now())
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="btn btn-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-60"
    >
      {sending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>جاري الإرسال...</span>
        </>
      ) : lastSent ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>تم الإرسال بنجاح ✅</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          <span>إرسال إشعار يومي لتجار التجزئة</span>
        </>
      )}
    </button>
  )
}
