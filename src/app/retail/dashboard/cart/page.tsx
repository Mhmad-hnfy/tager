'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '@/store/cartStore'
import { cn, formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, removeItem, updateQty, clearCart, total, wholesaleId, itemCount } = useCart()
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitOrder = async () => {
    if (!session?.user) { router.push('/auth/login'); return }
    if (!items.length || !wholesaleId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wholesaleId,
          notes,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ في إرسال الطلب'); return }

      toast.success('تم إرسال الطلب بنجاح! 🎉')
      clearCart()
      router.push('/retail/dashboard/orders')
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <ShoppingCart className="w-20 h-20 text-slate-200 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">سلة الطلبات فارغة</h2>
          <p className="text-slate-400 mb-6">لم تضيف أي منتجات بعد</p>
          <Link href="/retail/dashboard" className="btn btn-primary">
            <ArrowRight className="w-4 h-4 rtl-flip" />
            تصفح التجار
          </Link>
        </motion.div>
      </div>
    )
  }

  const merchantName = items[0]?.wholesaleName

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">سلة الطلبات</h1>
          <p className="section-subtitle">من: {merchantName}</p>
        </div>
        <button
          onClick={() => { if (confirm('هل تريد تفريغ السلة؟')) clearCart() }}
          className="btn btn-ghost btn-sm text-danger-500"
        >
          <Trash2 className="w-4 h-4" />
          تفريغ السلة
        </button>
      </div>

      {/* Items */}
      <div className="card divide-y divide-slate-50">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 flex items-center gap-3"
            >
              {/* Image */}
              <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.nameAr} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm truncate">{item.nameAr}</h3>
                <p className="text-primary-700 font-bold text-sm">{formatPrice(item.price)}</p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.productId, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-slate-800 text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQty}
                  className="w-7 h-7 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-sm font-bold text-slate-700 w-16 text-left">
                {formatPrice(item.price * item.quantity)}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                className="p-1.5 text-slate-300 hover:text-danger-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notes */}
      <div className="card p-4">
        <label className="form-label">ملاحظات على الطلب (اختياري)</label>
        <textarea
          className="form-input resize-none"
          rows={3}
          placeholder="أضف أي ملاحظات للتاجر..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Order Summary */}
      <div className="card p-5">
        <h2 className="font-bold text-slate-800 mb-4">ملخص الطلب</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>عدد المنتجات</span>
            <span>{itemCount} قطعة</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>عدد الأصناف</span>
            <span>{items.length} صنف</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>تاجر الجملة</span>
            <span>{merchantName}</span>
          </div>
          <div className="divider" />
          <div className="flex justify-between font-black text-lg">
            <span>الإجمالي</span>
            <span className="text-primary-700">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4 text-sm text-blue-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          سيصلك إشعار عندما يقبل التاجر طلبك
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={submitting}
          className="btn btn-primary w-full btn-lg mt-4"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </div>
    </div>
  )
}
