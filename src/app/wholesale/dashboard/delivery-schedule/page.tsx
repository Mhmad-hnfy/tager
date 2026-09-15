'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Plus, Calendar, MapPin, Clock, Edit2, Trash2,
  CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, X, ShieldCheck
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

interface Wilaya {
  id: string
  nameAr: string
  code: string
}

interface DeliverySchedule {
  id: string
  dayOfWeek: number
  dayNameAr: string
  wilayaId: string | null
  zoneName: string
  communeNames: string | null
  notes: string | null
  isActive: boolean
  wilaya?: Wilaya | null
  createdAt: string
}

export default function DeliverySchedulePage() {
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([])
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loading, setLoading] = useState(true)
  const [dayFilter, setDayFilter] = useState<number | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DeliverySchedule | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    dayOfWeek: 6,
    dayNameAr: 'السبت',
    wilayaId: '',
    zoneName: '',
    communeNames: '',
    notes: '',
    isActive: true,
  })

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wholesale/delivery-schedule')
      const data = await res.json()
      setSchedules(data.schedules || [])
    } catch {
      toast.error('حدث خطأ في تحميل جدول التوزيع')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
    fetch('/api/wilayas')
      .then(r => r.json())
      .then(d => setWilayas(d.wilayas || []))
      .catch(() => {})
  }, [])

  const openAddModal = (defaultDay?: number) => {
    const dayVal = defaultDay !== undefined ? defaultDay : (dayFilter !== null ? dayFilter : 6)
    const dayObj = DAYS_OF_WEEK.find(d => d.value === dayVal) || DAYS_OF_WEEK[0]
    setEditingItem(null)
    setForm({
      dayOfWeek: dayObj.value,
      dayNameAr: dayObj.label,
      wilayaId: wilayas[0]?.id || '',
      zoneName: '',
      communeNames: '',
      notes: '',
      isActive: true,
    })
    setModalOpen(true)
  }

  const openEditModal = (item: DeliverySchedule) => {
    setEditingItem(item)
    setForm({
      dayOfWeek: item.dayOfWeek,
      dayNameAr: item.dayNameAr,
      wilayaId: item.wilayaId || '',
      zoneName: item.zoneName,
      communeNames: item.communeNames || '',
      notes: item.notes || '',
      isActive: item.isActive,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.zoneName.trim()) {
      toast.error('يرجى كتابة اسم المنطقة أو البلديات')
      return
    }

    setSaving(true)
    try {
      const url = editingItem
        ? `/api/wholesale/delivery-schedule/${editingItem.id}`
        : '/api/wholesale/delivery-schedule'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ أثناء الحفظ')
        return
      }

      toast.success(editingItem ? 'تم تحديث منطقة التوزيع بنجاح! ✅' : 'تمت إضافة منطقة التوزيع بنجاح! 🎉')
      setModalOpen(false)
      fetchSchedules()
    } catch {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item: DeliverySchedule) => {
    try {
      const res = await fetch(`/api/wholesale/delivery-schedule/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (res.ok) {
        toast.success(item.isActive ? 'تم إيقاف التوزيع مؤقتاً في هذه المنطقة' : 'تم تفعيل التوزيع في هذه المنطقة')
        fetchSchedules()
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة من جدول التوزيع؟')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/wholesale/delivery-schedule/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('تم حذف المنطقة من الجدول')
        fetchSchedules()
      } else {
        toast.error('تعذر الحذف')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredSchedules = dayFilter === null
    ? schedules
    : schedules.filter(s => s.dayOfWeek === dayFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-right">
        <div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="section-title text-xl sm:text-2xl">جدول التوزيع ومناطق التوصيل الأسبوعي</h1>
              <p className="section-subtitle text-xs sm:text-sm">
                حدد أيام الأسبوع والمناطق/الولايات لتسهيل عمل الموزعين وإعلام تجار التجزئة بمواعيد وصول البضاعة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2">
          <button onClick={fetchSchedules} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button onClick={() => openAddModal()} className="btn btn-primary btn-sm sm:btn-md shadow-sm">
            <Plus className="w-4 h-4" />
            إضافة منطقة توزيع
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700">
          <span className="font-bold text-primary-800">كيف يعمل جدول التوزيع؟</span>
          <p className="text-slate-600 mt-0.5">
            يمكنك مثلاً تعيين: <b>السبت</b> (ولاية الجزائر - المنطقة A)، <b>الأحد</b> (المنطقة K و B)، <b>الإثنين</b> (المنطقة X).
            تظهر هذه المواعيد لتجار التجزئة في صفحة متجرك ليطلبوا بضاعتهم مسبقاً في اليوم المناسب لمنطقتهم!
          </p>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="card p-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setDayFilter(null)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all',
              dayFilter === null
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
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
                  dayFilter === day.value
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <span>{day.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold',
                    dayFilter === day.value ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="card empty-state py-16 text-center">
          <Truck className="w-16 h-16 text-slate-200 mb-3 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg mb-1">
            {dayFilter !== null
              ? `لا توجد مناطق توزيع مسجلة ليوم ${DAYS_OF_WEEK.find(d => d.value === dayFilter)?.label}`
              : 'لم تقم بإضافة أي مناطق توزيع بعد'}
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            ابدأ بتسجيل أيام التوزيع ومناطق توصيل الطلبات الخاصة بمتجرك
          </p>
          <button onClick={() => openAddModal()} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            إضافة أول منطقة توزيع
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSchedules.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'card p-5 relative flex flex-col justify-between border-2 transition-all hover:shadow-md',
                  item.isActive ? 'border-transparent hover:border-primary-200' : 'opacity-70 bg-slate-50 border-slate-200'
                )}
              >
                <div>
                  {/* Card Header: Day & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 font-bold px-3 py-1 rounded-xl text-xs">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      يوم {item.dayNameAr}
                    </span>

                    <button
                      onClick={() => toggleActive(item)}
                      className={cn(
                        'badge text-[11px] font-semibold cursor-pointer transition-colors',
                        item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      )}
                      title="اضغط للتبديل"
                    >
                      {item.isActive ? 'توزيع نشط' : 'متوقف مؤقتاً'}
                    </button>
                  </div>

                  {/* Zone Name & Wilaya */}
                  <div className="mb-3 text-center sm:text-right">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                      <MapPin className="w-4 h-4 text-danger-600 flex-shrink-0" />
                      {item.zoneName}
                    </h3>
                    {item.wilaya && (
                      <p className="text-xs font-semibold text-primary-700 mt-0.5">
                        ولاية {item.wilaya.nameAr}
                      </p>
                    )}
                  </div>

                  {/* Commune details if any */}
                  {item.communeNames && (
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 mb-3 border border-slate-100">
                      <span className="font-bold text-slate-700">المناطق المشمولة: </span>
                      {item.communeNames}
                    </div>
                  )}

                  {/* Delivery Notes */}
                  {item.notes && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl text-amber-900">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {item.isActive ? 'متاح للطلب' : 'معطل مؤقتاً'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-700 transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger-600 transition-colors"
                      title="حذف"
                    >
                      {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card bg-white w-full max-w-lg overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {editingItem ? 'تعديل منطقة التوزيع' : 'إضافة منطقة توزيع جديدة'}
                    </h3>
                    <p className="text-xs text-slate-400">حدد اليوم والولاية والمنطقة المراد التوزيع فيها</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Day of Week */}
                <div className="form-group">
                  <label className="form-label">يوم التوزيع الأسبوعي *</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() => setForm(f => ({ ...f, dayOfWeek: day.value, dayNameAr: day.label }))}
                        className={cn(
                          'py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center',
                          form.dayOfWeek === day.value
                            ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wilaya Selection */}
                <div className="form-group">
                  <label className="form-label">الولاية (اختياري / حسب التوزيع)</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      className="form-input pr-9 appearance-none"
                      value={form.wilayaId}
                      onChange={e => setForm(f => ({ ...f, wilayaId: e.target.value }))}
                    >
                      <option value="">-- جميع الولايات أو غير محدد --</option>
                      {wilayas.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Zone Name */}
                <div className="form-group">
                  <label className="form-label">اسم المنطقة / الرمز *</label>
                  <input
                    className="form-input"
                    placeholder="مثال: المنطقة A، أو أحياء شرق العاصمة، أو المنطقة K و B"
                    value={form.zoneName}
                    onChange={e => setForm(f => ({ ...f, zoneName: e.target.value }))}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    يمكنك كتابة تسمية المناطق المعتمدة لديك (مثل: A, B, X, K...)
                  </p>
                </div>

                {/* Communes / details */}
                <div className="form-group">
                  <label className="form-label">تفاصيل البلديات أو الأحياء المشمولة (اختياري)</label>
                  <input
                    className="form-input"
                    placeholder="مثال: بئر خادم، حيدرة، بن عكنون، القبة..."
                    value={form.communeNames}
                    onChange={e => setForm(f => ({ ...f, communeNames: e.target.value }))}
                  />
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">ملاحظات التوزيع (مواعيد، شروط التوصيل)</label>
                  <textarea
                    className="form-input resize-none"
                    rows={2}
                    placeholder="مثال: التوزيع من 8 صباحاً إلى 2 ظهراً، الحد الأدنى للطلبية 20,000 د.ج"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-700 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    تفعيل التوزيع في هذا اليوم والمنطقة حالياً
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary flex-1 shadow-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {saving ? 'جاري الحفظ...' : editingItem ? 'حفظ التعديلات' : 'إضافة المنطقة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
