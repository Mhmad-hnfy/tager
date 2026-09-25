'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  ClipboardList, Search, Filter, Check, X, Clock,
  Package, Loader2, ChevronDown, Phone, MapPin, Eye, FileText,
  ExternalLink, Truck, Bell, Send, CheckCircle2, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, generateOrderNumber } from '@/lib/utils'
import { InvoiceModal } from '@/components/InvoiceModal'

const ORDER_STATUSES = [
  { value: '', label: 'جميع الطلبات' },
  { value: 'NEW', label: 'جديد' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'ACCEPTED', label: 'مقبول' },
  { value: 'READY', label: 'جاهز' },
  { value: 'OUT_FOR_DELIVERY', label: 'في الطريق' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'REJECTED', label: 'مرفوض' },
]

function WholesaleOrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null)

  // Arrival Reminder Modal states
  const [reminderOrder, setReminderOrder] = useState<any | null>(null)
  const [reminderMinutes, setReminderMinutes] = useState<number>(60)
  const [reminderCustomNote, setReminderCustomNote] = useState<string>('')
  const [reminderSetOutForDelivery, setReminderSetOutForDelivery] = useState<boolean>(true)
  const [sendingReminder, setSendingReminder] = useState<boolean>(false)
  const [whatsappUrlAfterSend, setWhatsappUrlAfterSend] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const url = `/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`تم تغيير الحالة إلى: ${getOrderStatusLabel(status)}`)
        fetchOrders()
      } else {
        toast.error('خطأ في تحديث الحالة')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setUpdatingId(null)
    }
  }

  const openReminderModal = (order: any) => {
    setReminderOrder(order)
    setReminderMinutes(60)
    setReminderCustomNote('')
    setReminderSetOutForDelivery(true)
    setWhatsappUrlAfterSend(null)
  }

  const handleSendArrivalReminder = async () => {
    if (!reminderOrder) return
    setSendingReminder(true)
    try {
      const res = await fetch(`/api/orders/${reminderOrder.id}/notify-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: reminderMinutes,
          customNote: reminderCustomNote,
          setStatusOutForDelivery: reminderSetOutForDelivery,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'خطأ في إرسال الإشعار')
        return
      }

      toast.success(data.message || 'تم إرسال إشعار التذكير لتاجر التجزئة بنجاح 🔔')
      if (data.whatsappUrl) {
        setWhatsappUrlAfterSend(data.whatsappUrl)
      } else {
        setReminderOrder(null)
      }
      fetchOrders()
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setSendingReminder(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">الطلبات الواردة</h1>
          <p className="section-subtitle">{orders.length} طلب</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="card p-2">
        <div className="flex gap-1 overflow-x-auto">
          {ORDER_STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                statusFilter === s.value
                  ? 'bg-primary-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card empty-state py-20">
          <ClipboardList className="w-16 h-16 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order, i) => {
              const hasSentReminder = order.notes && order.notes.includes('تذكير وصول')
              const canRemind = ['ACCEPTED', 'READY', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(order.status)

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    'card overflow-hidden transition-all',
                    order.status === 'OUT_FOR_DELIVERY' && 'border-amber-300 ring-1 ring-amber-200 shadow-sm'
                  )}
                >
                  {/* Order Header */}
                  <div
                    className="p-3 sm:p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-800 text-sm">{generateOrderNumber(order.id)}</span>
                          <span className={cn('badge text-xs', getOrderStatusColor(order.status))}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                          {hasSentReminder && (
                            <span className="badge bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center gap-1 font-semibold">
                              <Bell className="w-3 h-3 text-amber-600" />
                              تم إرسال تذكير الوصول
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          <span className="font-medium text-slate-700">{order.retail?.shopName}</span>
                          <span className="text-slate-400"> · {order.items?.length} منتج</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="font-black text-primary-700 text-sm">{formatPrice(order.total)}</div>

                        {canRemind && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReminderModal(order)
                            }}
                            title="تنبيه تاجر التجزئة بالوصول خلال ساعة"
                            className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">سأصل خلال ساعة</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedInvoiceOrder(order)
                          }}
                          className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900 text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary-400" />
                          <span className="hidden sm:inline">الفاتورة</span>
                        </button>
                        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', expandedOrder === order.id && 'rotate-180')} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100"
                      >
                        <div className="p-4 space-y-4">
                          {/* Retail info & Google Maps */}
                          <div className="bg-slate-50 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm border border-slate-200/60">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-bold text-slate-900">{order.retail?.shopName}</span>
                              <span className="text-slate-500 font-medium">({order.retail?.ownerName})</span>
                              <div className="flex items-center gap-1.5 text-slate-600 font-semibold" dir="ltr">
                                <Phone className="w-3.5 h-3.5 text-primary-600" />
                                <span>{order.retail?.phone}</span>
                              </div>
                              {(order.retail?.wilaya || order.retail?.commune || order.retail?.address) && (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-danger-500" />
                                  <span>
                                    {order.retail?.wilaya?.nameAr}
                                    {order.retail?.commune ? ` - ${order.retail.commune.nameAr}` : ''}
                                    {order.retail?.address ? ` (${order.retail.address})` : ''}
                                  </span>
                                </div>
                              )}
                              {order.retail?.zoneName && (
                                <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                                  📍 منطقة: {order.retail.zoneName}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                              {canRemind && (
                                <button
                                  type="button"
                                  onClick={() => openReminderModal(order)}
                                  className="btn btn-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>تنبيه بالوصول (خلال ساعة) 🔔</span>
                                </button>
                              )}

                              {order.retail?.mapUrl ? (
                                <a
                                  href={order.retail.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>🗺️ موقع المحل (Google Maps)</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400">لم يحدد موقع خرائط</span>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="btn btn-sm bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>طباعة الفاتورة</span>
                              </button>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2">المنتجات المطلوبة:</p>
                            <div className="space-y-2">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-700">{item.product?.nameAr}</span>
                                  <div className="flex items-center gap-3 text-slate-500">
                                    <span>x{item.quantity}</span>
                                    <span className="font-semibold text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="divider" />
                            <div className="flex justify-between font-bold">
                              <span>الإجمالي</span>
                              <span className="text-primary-700">{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 whitespace-pre-line">
                              <span className="font-semibold">ملاحظات وسجل التنبيهات: </span>
                              <div className="mt-1">{order.notes}</div>
                            </div>
                          )}

                          {/* Status Actions */}
                          {!['COMPLETED', 'REJECTED'].includes(order.status) && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2">تغيير حالة الطلب:</p>
                              <div className="flex flex-wrap gap-2">
                                {order.status === 'NEW' && (
                                  <>
                                    <button onClick={() => updateStatus(order.id, 'ACCEPTED')} disabled={updatingId === order.id}
                                      className="btn btn-primary btn-sm">
                                      {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                      قبول
                                    </button>
                                    <button onClick={() => updateStatus(order.id, 'PROCESSING')} disabled={updatingId === order.id}
                                      className="btn btn-outline btn-sm">
                                      قيد المعالجة
                                    </button>
                                    <button onClick={() => updateStatus(order.id, 'REJECTED')} disabled={updatingId === order.id}
                                      className="btn btn-sm text-danger-600 border-2 border-danger-200 hover:bg-red-50">
                                      <X className="w-3 h-3" /> رفض
                                    </button>
                                  </>
                                )}

                                {order.status === 'PROCESSING' && (
                                  <>
                                    <button onClick={() => updateStatus(order.id, 'ACCEPTED')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                      <Check className="w-3 h-3" /> قبول
                                    </button>
                                    <button onClick={() => updateStatus(order.id, 'REJECTED')} disabled={updatingId === order.id}
                                      className="btn btn-sm text-danger-600 border-2 border-danger-200 hover:bg-red-50">
                                      <X className="w-3 h-3" /> رفض
                                    </button>
                                  </>
                                )}

                                {order.status === 'ACCEPTED' && (
                                  <>
                                    <button onClick={() => updateStatus(order.id, 'READY')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                      جاهز للاستلام
                                    </button>
                                    <button onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')} disabled={updatingId === order.id} className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-bold">
                                      <Truck className="w-3 h-3" /> في الطريق للتسليم
                                    </button>
                                  </>
                                )}

                                {order.status === 'READY' && (
                                  <>
                                    <button onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')} disabled={updatingId === order.id} className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-bold">
                                      <Truck className="w-3 h-3" /> في الطريق للتسليم (الوصول خلال ساعة)
                                    </button>
                                    <button onClick={() => updateStatus(order.id, 'COMPLETED')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                      <Check className="w-3 h-3" /> تم التسليم بنجاح
                                    </button>
                                  </>
                                )}

                                {order.status === 'OUT_FOR_DELIVERY' && (
                                  <button onClick={() => updateStatus(order.id, 'COMPLETED')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                    <Check className="w-3 h-3" /> تم تسليم الطلبية وإكمالها ✅
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Arrival Reminder Modal */}
      {reminderOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">إشعار التاجر بقرب الوصول</h3>
                  <p className="text-amber-100 text-xs">إرسال تنبيه مسبق لتاجر التجزئة</p>
                </div>
              </div>
              <button
                onClick={() => setReminderOrder(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Retail details brief */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">الطلب:</span>
                  <span className="font-bold text-slate-800">{generateOrderNumber(reminderOrder.id)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">محل التجزئة:</span>
                  <span className="font-bold text-slate-900">{reminderOrder.retail?.shopName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">الهاتف:</span>
                  <span className="font-semibold text-slate-700" dir="ltr">{reminderOrder.retail?.phone}</span>
                </div>
                {(reminderOrder.retail?.wilaya?.nameAr || reminderOrder.retail?.address) && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">العنوان:</span>
                    <span className="text-slate-700 truncate max-w-[200px]">
                      {reminderOrder.retail?.wilaya?.nameAr} - {reminderOrder.retail?.commune?.nameAr || reminderOrder.retail?.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Time selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">الوقت المتوقع للوصول:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { minutes: 60, label: '⏱️ خلال ساعة (60 دقيقة)' },
                    { minutes: 30, label: '⚡ خلال 30 دقيقة' },
                    { minutes: 15, label: '🚀 خلال 15 دقيقة' },
                    { minutes: 120, label: '⏳ خلال ساعتين' },
                  ].map(t => (
                    <button
                      key={t.minutes}
                      type="button"
                      onClick={() => setReminderMinutes(t.minutes)}
                      className={cn(
                        'py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center',
                        reminderMinutes === t.minutes
                          ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظة إضافية للتاجر (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: يرجى تجهيز المبلغ / التواجد بالمحل"
                  value={reminderCustomNote}
                  onChange={e => setReminderCustomNote(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              {/* Change status checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={reminderSetOutForDelivery}
                  onChange={e => setReminderSetOutForDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">
                  تغيير حالة الطلب تلقائياً إلى &quot;في الطريق للتسليم&quot;
                </span>
              </label>

              {/* Sent WhatsApp link banner if already sent */}
              {whatsappUrlAfterSend && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم إرسال الإشعار داخل التطبيق بنجاح!</span>
                  </div>
                  <p className="text-emerald-700 text-xs">يمكنك أيضاً إرسال الرسالة عبر الواتساب بنقرة واحدة:</p>
                  <a
                    href={whatsappUrlAfterSend}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 w-full shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>فتح واتساب وإرسال التنبيه الآن</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReminderOrder(null)}
                className="btn btn-ghost btn-sm text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSendArrivalReminder}
                disabled={sendingReminder}
                className="btn btn-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                {sendingReminder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال إشعار التذكير فوراً 🔔</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  )
}

export default function WholesaleOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <WholesaleOrdersContent />
    </Suspense>
  )
}
