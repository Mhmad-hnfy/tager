'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Trash2, Eye, EyeOff, Loader2, RefreshCw, Store, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { cn, formatPrice, parseImages } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف المنتج بنجاح ✅')
        setProductToDelete(null)
        fetchProducts()
      } else {
        toast.error('خطأ في الحذف')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleHide = async (product: any) => {
    setUpdatingId(product.id)
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !product.isHidden }),
    })
    if (res.ok) { toast.success(product.isHidden ? 'تم إظهار المنتج' : 'تم إخفاء المنتج'); fetchProducts() }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="page-header flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-xl sm:text-2xl font-black">إدارة المنتجات</h1>
          <p className="section-subtitle text-xs sm:text-sm">{products.length} منتج مسجل بالمنصة</p>
        </div>
        <button onClick={fetchProducts} className="btn btn-ghost btn-sm">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      <div className="card p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9 text-xs sm:text-sm"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="card py-12 flex justify-center items-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="card py-12 text-center text-slate-400 text-sm">لا توجد منتجات</div>
        ) : (
          products.map((product, i) => {
            const images = parseImages(product.images)
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn('card p-3.5 space-y-3 border border-slate-100 shadow-xs', product.isHidden && 'opacity-60')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200/60">
                    {images[0] ? (
                      <Image src={images[0]} alt={product.nameAr} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{product.nameAr}</h3>
                      <span className={cn('badge text-[10px] flex-shrink-0', product.isHidden ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700')}>
                        {product.isHidden ? 'مخفي' : 'نشط'}
                      </span>
                    </div>
                    {product.wholesale && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Store className="w-3 h-3 text-primary-600" />
                        <span className="truncate">{product.wholesale.companyName}</span>
                      </div>
                    )}
                    {product.category && (
                      <span className="inline-block mt-1 badge bg-slate-100 text-slate-600 text-[10px]">
                        {product.category.nameAr}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary-700 text-sm">{formatPrice(product.price)}</span>
                    <span className="text-slate-400">· الكمية: {product.quantity}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleHide(product)}
                      disabled={updatingId === product.id}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                      title={product.isHidden ? 'إظهار' : 'إخفاء'}
                    >
                      {updatingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-danger-500"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>التاجر</th>
                <th>القسم</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">لا توجد منتجات</td></tr>
              ) : products.map((product, i) => {
                const images = parseImages(product.images)
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(product.isHidden && 'opacity-50')}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {images[0] ? (
                            <Image src={images[0]} alt={product.nameAr} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{product.nameAr}</div>
                          {product.nameFr && <div className="text-xs text-slate-400">{product.nameFr}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Store className="w-3.5 h-3.5" />
                        {product.wholesale?.companyName}
                      </div>
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge bg-slate-100 text-slate-600 text-xs">{product.category.nameAr}</span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="font-bold text-primary-700">{formatPrice(product.price)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <div>
                        {product.isHidden ? (
                          <span className="badge bg-slate-100 text-slate-600 text-xs">مخفي</span>
                        ) : (
                          <span className="badge bg-green-50 text-green-600 text-xs">نشط</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleHide(product)}
                          disabled={updatingId === product.id}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                          title={product.isHidden ? 'إظهار' : 'إخفاء'}
                        >
                          {updatingId === product.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                          }
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-danger-400 hover:text-danger-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 text-right shadow-2xl border-2 border-red-200 my-auto overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-danger-600 mb-4 mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                  تأكيد حذف المنتج كمسؤول
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                  هل أنت متأكد من حذف المنتج{' '}
                  <span className="font-bold text-slate-800">"{productToDelete.nameAr}"</span>؟
                  سيتم حذفه نهائياً من المنصة.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="btn btn-sm sm:btn-md bg-danger-600 hover:bg-danger-700 text-white font-bold flex-1 shadow-danger"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>{deleting ? 'جاري الحذف...' : 'نعم، احذف'}</span>
                  </button>
                  <button
                    onClick={() => setProductToDelete(null)}
                    disabled={deleting}
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
