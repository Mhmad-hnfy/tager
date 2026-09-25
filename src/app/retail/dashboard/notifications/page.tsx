'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

export default function RetailNotificationsPage() {
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
          {notifications.map((notif, i) => {
            const isDeliveryReminder = notif.type === 'DELIVERY_REMINDER'
            return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    'p-4 flex items-start gap-3 transition-colors',
                    isDeliveryReminder
                      ? 'bg-amber-50/70 border-r-4 border-amber-500'
                      : !notif.isRead
                        ? 'bg-red-50/30'
                        : ''
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                    isDeliveryReminder
                      ? 'bg-amber-100 text-amber-700 shadow-xs'
                      : notif.type === 'ORDER_STATUS_CHANGED'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-orange-100 text-orange-600'
                  )}>
                    {isDeliveryReminder ? (
                      <span className="text-lg">🚚</span>
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className={cn('font-bold text-sm', isDeliveryReminder ? 'text-amber-950' : 'text-slate-800')}>
                        {notif.titleAr}
                      </p>
                      {isDeliveryReminder && (
                        <span className="badge bg-amber-200 text-amber-900 border border-amber-300 text-2xs font-extrabold">
                          تنبيه وصول
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 text-sm mt-0.5 whitespace-pre-line leading-relaxed">
                      {notif.messageAr}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <p className="text-xs text-slate-400">{formatDate(notif.createdAt)}</p>
                      {notif.link && (
                        <a
                          href={notif.link}
                          className="btn btn-sm bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-1 px-3 rounded-lg shadow-2xs"
                        >
                          متابعة الطلبية 📦
                        </a>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 bg-danger-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                  )}
                </motion.div>
              )
          })}
        </div>
      )}
    </div>
  )
}
