'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Calendar, MapPin, Store, Trash2, Search,
  Loader2, RefreshCw, CheckCircle, Clock, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const DAYS_OF_WEEK = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
]

function AdminDeliverySchedulesContent() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dayFilter, setDayFilter] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [scheduleToDelete, setScheduleToDelete] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dayFilter !== null) params.set('dayOfWeek', dayFilter.toString())
      const res = await fetch(`/api/admin/delivery-schedules?${params}`)
      const data = await res.json()
      setSchedules(data.schedules || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [dayFilter])

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return
    const id = scheduleToDelete.id
    setDeletingId(id)
    try {
      const res = await fetch(`/api/wholesale/delivery-schedule/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('تم حذف السجل بنجاح ✅')
        setScheduleToDelete(null)
        fetchSchedules()
      } else {
        toast.error('فشل في الحذف')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = schedules.filter(s => {
    if (!search) return true
    return (
      s.zoneName?.includes(search) ||
      s.communeNames?.includes(search) ||
      s.wholesale?.companyName?.includes(search) ||
      s.wilaya?.nameAr?.includes(search)
    )
  })

  return (
    <div className="space-y-5">
      <div className="page-header flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="section-title text-xl sm:text-2xl font-black text-slate-800">
                متابعة جداول ومناطق التوزيع
              </h1>
              <p className="section-subtitle text-xs sm:text-sm">
                استعراض ومراقبة جميع مواعيد التوزيع الأسبوعية الخاصة بتجار الجملة في كل ولاية
              </p>
            </div>
          </div>
        </div>
        <button onClick={fetchSchedules} className="btn btn-ghost btn-sm">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      {/* Day Filter Pills */}
      <div className="card p-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setDayFilter(null)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all',
              dayFilter === null ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            جميع الأيام ({schedules.length})
          </button>
          {DAYS_OF_WEEK.map(day => {
            const count = schedules.filter(s => s.dayOfWeek === day.value).length
            return (
              <button
                key={day.value}
                onClick={() => setDayFilter(day.value)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  dayFilter === day.value ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <span>{day.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold',
                    dayFilter === day.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="بحث باسم التاجر، المنطقة، أو الولاية..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state py-16 text-center">
          <Truck className="w-14 h-14 text-slate-200 mb-3 mx-auto" />
          <p className="text-slate-500 font-semibold">لا توجد مناطق توزيع مسجلة</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs bg-primary-50 text-primary-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary-600" />
                      يوم {item.dayNameAr}
                    </span>
                    <span className={cn('badge text-[10px]', item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {item.isActive ? 'نشط' : 'متوقف'}
                    </span>
                  </div>

                  {/* Merchant Info */}
                  <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2 rounded-xl">
                    <Store className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {item.wholesale?.companyName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.wholesale?.ownerName} · <span dir="ltr">{item.wholesale?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Zone Details */}
                  <div className="space-y-1 mb-2">
                    <div className="font-black text-slate-800 text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-danger-500 flex-shrink-0" />
                      {item.zoneName}
                    </div>
                    {item.wilaya && (
                      <p className="text-xs text-primary-700 font-semibold">ولاية {item.wilaya.nameAr}</p>
                    )}
                    {item.communeNames && (
                      <p className="text-xs text-slate-500">{item.communeNames}</p>
                    )}
                    {item.notes && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setScheduleToDelete(item)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger-600 transition-colors"
                    title="حذف من قبل الإدارة"
                  >
                    {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Responsive Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {scheduleToDelete && (
          <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 text-right shadow-2xl border-2 border-red-200 my-auto overflow-hidden mx-auto"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-danger-600 mb-4 mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                  تأكيد حذف منطقة التوزيع
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                  هل أنت متأكد من حذف منطقة{' '}
                  <span className="font-bold text-slate-800">"{scheduleToDelete.zoneName}"</span>{' '}
                  التابعة للتاجر{' '}
                  <span className="font-bold text-slate-800">"{scheduleToDelete.wholesale?.companyName}"</span>{' '}
                  (يوم {scheduleToDelete.dayNameAr}) كمسؤول؟
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingId === scheduleToDelete.id}
                    className="btn btn-sm sm:btn-md bg-danger-600 hover:bg-danger-700 text-white font-bold flex-1 shadow-danger"
                  >
                    {deletingId === scheduleToDelete.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>{deletingId === scheduleToDelete.id ? 'جاري الحذف...' : 'نعم، احذف'}</span>
                  </button>
                  <button
                    onClick={() => setScheduleToDelete(null)}
                    disabled={Boolean(deletingId)}
                    className="btn btn-sm sm:btn-md btn-ghost"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminDeliverySchedulesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <AdminDeliverySchedulesContent />
    </Suspense>
  )
}
