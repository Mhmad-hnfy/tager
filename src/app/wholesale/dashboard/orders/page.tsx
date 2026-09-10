'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  ClipboardList, Search, Filter, Check, X, Clock,
  Package, Loader2, ChevronDown, Phone, MapPin, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, generateOrderNumber } from '@/lib/utils'

const ORDER_STATUSES = [
  { value: '', label: 'جميع الطلبات' },
  { value: 'NEW', label: 'جديد' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'ACCEPTED', label: 'مقبول' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'READY', label: 'جاهز' },
  { value: 'COMPLETED', label: 'مكتمل' },
]

function WholesaleOrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.04 }}
                className="card overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-800">{generateOrderNumber(order.id)}</span>
                    <span className={cn('badge', getOrderStatusColor(order.status))}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <div className="text-sm text-slate-500 flex-1">
                      <span className="font-medium text-slate-700">{order.retail?.shopName}</span>
                      {' · '}
                      {order.items?.length} منتج
                    </div>
                    <div className="font-black text-primary-700">{formatPrice(order.total)}</div>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedOrder === order.id && 'rotate-180')} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{formatDate(order.createdAt)}</div>
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
                        {/* Retail info */}
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{order.retail?.phone}</span>
                          </div>
                          {order.retail?.wilaya && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{order.retail.wilaya.nameAr}</span>
                            </div>
                          )}
                          <span className="font-medium">{order.retail?.ownerName}</span>
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
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                            <span className="font-semibold">ملاحظات: </span>{order.notes}
                          </div>
                        )}

                        {/* Status Actions */}
                        {!['COMPLETED', 'REJECTED'].includes(order.status) && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2">تغيير الحالة:</p>
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
                                <button onClick={() => updateStatus(order.id, 'READY')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                  جاهز للاستلام
                                </button>
                              )}
                              {order.status === 'READY' && (
                                <button onClick={() => updateStatus(order.id, 'COMPLETED')} disabled={updatingId === order.id} className="btn btn-primary btn-sm">
                                  <Check className="w-3 h-3" /> مكتمل
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
            ))}
          </AnimatePresence>
        </div>
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
