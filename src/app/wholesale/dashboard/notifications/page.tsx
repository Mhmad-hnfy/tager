'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifs = async () => {
    setLoading(true)
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications || [])
    setUnreadCount(data.unreadCount || 0)
    setLoading(false)
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    fetchNotifs()
  }

  useEffect(() => { fetchNotifs() }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">الإشعارات</h1>
          {unreadCount > 0 && <p className="section-subtitle">{unreadCount} غير مقروء</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-ghost btn-sm">
            <CheckCheck className="w-4 h-4" /> تعليم الكل كمقروء
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state py-20">
          <Bell className="w-16 h-16 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-50">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn('p-4 flex items-start gap-3', !notif.isRead && 'bg-primary-50/40')}
            >
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                notif.type === 'ORDER_NEW' ? 'bg-orange-100' : 'bg-primary-100'
              )}>
                <Bell className={cn('w-4 h-4', notif.type === 'ORDER_NEW' ? 'text-orange-600' : 'text-primary-600')} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{notif.titleAr}</p>
                <p className="text-slate-600 text-sm mt-0.5">{notif.messageAr}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
