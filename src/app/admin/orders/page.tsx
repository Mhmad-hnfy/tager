'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Search, ChevronDown, Loader2, RefreshCw, Store, ShoppingBag, FileText } from 'lucide-react'
import { cn, formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, generateOrderNumber } from '@/lib/utils'
import { InvoiceModal } from '@/components/InvoiceModal'

const STATUS_FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'NEW', label: 'جديد' },
  { value: 'PROCESSING', label: 'معالجة' },
  { value: 'ACCEPTED', label: 'مقبول' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'READY', label: 'جاهز' },
  { value: 'COMPLETED', label: 'مكتمل' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const filtered = orders.filter(o => {
    if (!search) return true
    return (
      o.retail?.shopName?.includes(search) ||
      o.wholesale?.companyName?.includes(search) ||
      o.id.includes(search)
    )
  })

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">متابعة الطلبات</h1>
          <p className="section-subtitle">{filtered.length} طلب</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-ghost btn-sm">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      {/* Status tabs */}
      <div className="card p-2">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                statusFilter === s.value ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="بحث بالاسم أو رقم الطلب..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state py-16">
          <ClipboardList className="w-14 h-14 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm">{generateOrderNumber(order.id)}</span>
                  <span className={cn('badge text-xs', getOrderStatusColor(order.status))}>
                    {getOrderStatusLabel(order.status)}
                  </span>

                  {/* Retail info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShoppingBag className="w-3.5 h-3.5 text-danger-400" />
                    <span className="font-medium">{order.retail?.shopName}</span>
                  </div>

                  <span className="text-slate-300">→</span>

                  {/* Wholesale info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Store className="w-3.5 h-3.5 text-primary-600" />
                    <span className="font-medium">{order.wholesale?.companyName}</span>
                  </div>

                  <div className="mr-auto flex items-center gap-2.5">
                    <span className="font-black text-primary-700 text-sm">{formatPrice(order.total)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedInvoiceOrder(order)
                      }}
                      className="btn btn-sm bg-slate-800 text-white hover:bg-slate-700 text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary-400" />
                      <span>الفاتورة</span>
                    </button>
                    <span className="text-xs text-slate-400">{order.items?.length} منتج</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expanded === order.id && 'rotate-180')} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{formatDate(order.createdAt)}</p>
              </div>

              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100"
                  >
                    <div className="p-4 space-y-3">
                      {/* Items table */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500">المنتجات:</p>
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                            <span className="text-slate-700">{item.product?.nameAr || 'منتج محذوف'}</span>
                            <div className="flex items-center gap-4 text-slate-500 text-xs">
                              <span>الكمية: {item.quantity}</span>
                              <span>السعر: {formatPrice(item.price)}</span>
                              <span className="font-semibold text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between font-bold border-t border-slate-100 pt-3">
                        <span>الإجمالي</span>
                        <span className="text-primary-700">{formatPrice(order.total)}</span>
                      </div>

                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                          <span className="font-semibold">ملاحظات: </span>{order.notes}
                        </div>
                      )}

                      {/* Order metadata */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                        <div>
                          <span className="font-semibold text-slate-700">تاجر التجزئة: </span>
                          {order.retail?.shopName}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">تاجر الجملة: </span>
                          {order.wholesale?.companyName}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">تاريخ الطلب: </span>
                          {formatDate(order.createdAt)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">آخر تحديث: </span>
                          {formatDate(order.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
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
