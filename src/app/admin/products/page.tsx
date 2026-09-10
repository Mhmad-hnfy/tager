'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Trash2, Eye, EyeOff, Loader2, RefreshCw, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { cn, formatPrice, parseImages } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    setUpdatingId(id)
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('تم الحذف'); fetchProducts() }
    else toast.error('خطأ في الحذف')
    setUpdatingId(null)
  }

  const handleToggleHide = async (product: any) => {
    setUpdatingId(product.id)
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !product.isHidden }),
    })
    if (res.ok) { toast.success(product.isHidden ? 'تم الإظهار' : 'تم الإخفاء'); fetchProducts() }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">إدارة المنتجات</h1>
          <p className="section-subtitle">{products.length} منتج</p>
        </div>
        <button onClick={fetchProducts} className="btn btn-ghost btn-sm">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
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
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {images[0] ? (
                            <Image src={images[0]} alt={product.nameAr} width={40} height={40} className="object-cover w-full h-full" />
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
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="font-bold text-primary-700">{formatPrice(product.price)}</td>
                    <td className="text-slate-500">{product.quantity}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {product.isHidden && (
                          <span className="badge bg-slate-100 text-slate-500 text-xs">مخفي</span>
                        )}
                        {!product.isAvailable && (
                          <span className="badge bg-red-50 text-danger-500 text-xs">غير متوفر</span>
                        )}
                        {product.isAvailable && !product.isHidden && (
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
                          onClick={() => handleDelete(product.id)}
                          disabled={updatingId === product.id}
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
    </div>
  )
}
