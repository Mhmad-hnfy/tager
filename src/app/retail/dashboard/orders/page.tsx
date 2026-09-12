'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, ChevronDown, Package, Loader2, FileText } from 'lucide-react'
import { cn, formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, generateOrderNumber } from '@/lib/utils'
import { InvoiceModal } from '@/components/InvoiceModal'

export default function RetailOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">طلباتي</h1>
        <p className="section-subtitle">{orders.length} طلب</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card empty-state py-20">
          <ClipboardList className="w-16 h-16 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لا توجد طلبات بعد</p>
          <p className="text-slate-400 text-sm">ابدأ بالتسوق من تجار الجملة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-slate-50/50"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{generateOrderNumber(order.id)}</span>
                      <span className={cn('badge', getOrderStatusColor(order.status))}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {order.wholesale?.companyName} · {order.items?.length} منتج
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary-700">{formatPrice(order.total)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedInvoiceOrder(order)
                      }}
                      className="btn btn-sm bg-slate-800 text-white hover:bg-slate-900 text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary-400" />
                      <span>الفاتورة</span>
                    </button>
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
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {item.product?.images && JSON.parse(item.product.images)[0] ? (
                                <img src={JSON.parse(item.product.images)[0]} className="w-8 h-8 rounded-lg object-cover" alt="" />
                              ) : (
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Package className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                              <span className="text-slate-700">{item.product?.nameAr}</span>
                            </div>
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
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                          <span className="font-semibold">ملاحظاتك: </span>{order.notes}
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="btn btn-sm bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-4 h-4" />
                          <span>📄 استعراض وتنزيل الفاتورة (PDF / صورة / طباعة)</span>
                        </button>
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
