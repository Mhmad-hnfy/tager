'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff, Package,
  Loader2, X, Upload, AlertCircle, CheckCircle, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, parseImages } from '@/lib/utils'

interface Category { id: string; nameAr: string }
interface Product {
  id: string
  nameAr: string
  nameFr?: string
  description?: string
  price: number
  quantity: number
  isAvailable: boolean
  isHidden: boolean
  images: string
  category?: Category
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nameAr: '', nameFr: '', description: '',
    price: '', quantity: '', categoryId: '',
    isAvailable: true, images: [] as string[],
  })
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?mine=true')
      const data = await res.json()
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({ nameAr: '', nameFr: '', description: '', price: '', quantity: '', categoryId: '', isAvailable: true, images: [] })
    setShowModal(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setForm({
      nameAr: p.nameAr, nameFr: p.nameFr || '', description: p.description || '',
      price: String(p.price), quantity: String(p.quantity), categoryId: p.category?.id || '',
      isAvailable: p.isAvailable, images: parseImages(p.images),
    })
    setShowModal(true)
  }

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.paths) {
        setForm(f => ({ ...f, images: [...f.images, ...data.paths] }))
      }
    } catch {
      toast.error('خطأ في رفع الصور')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nameAr || !form.price) { toast.error('اسم المنتج والسعر مطلوبان'); return }

    setSaving(true)
    try {
      const body = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) || 0 }
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || 'خطأ في الحفظ'); return }

      toast.success(editingProduct ? 'تم تعديل المنتج' : 'تم إضافة المنتج')
      setShowModal(false)
      fetchProducts()
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('تم حذف المنتج'); fetchProducts() }
    else toast.error('خطأ في الحذف')
  }

  const handleToggleHide = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !product.isHidden }),
    })
    if (res.ok) { toast.success(product.isHidden ? 'تم إظهار المنتج' : 'تم إخفاء المنتج'); fetchProducts() }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.nameAr.includes(search)
    const matchCat = !filterCat || p.category?.id === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="section-title">المنتجات</h1>
          <p className="section-subtitle">{products.length} منتج</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input sm:w-48 appearance-none"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">جميع الأقسام</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
        </select>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card py-20">
          <Package className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-semibold">لا توجد منتجات</p>
          <p className="text-slate-400 text-sm mb-4">ابدأ بإضافة منتجاتك</p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-4 h-4" /> إضافة منتج
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((product, i) => {
              const images = parseImages(product.images)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn('card group relative', product.isHidden && 'opacity-60')}
                >
                  {/* Image */}
                  <div className="aspect-square bg-slate-100 rounded-t-2xl overflow-hidden relative">
                    {images[0] ? (
                      <Image src={images[0]} alt={product.nameAr} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    {product.isHidden && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="badge bg-slate-700 text-white"><EyeOff className="w-3 h-3" /> مخفي</span>
                      </div>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute top-2 right-2">
                        <span className="badge bg-red-100 text-danger-600">غير متوفر</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-slate-800 text-sm truncate mb-1">{product.nameAr}</h3>
                    {product.category && (
                      <span className="badge bg-primary-50 text-primary-700 text-xs mb-2">{product.category.nameAr}</span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-primary-700">{formatPrice(product.price)}</span>
                      <span className="text-xs text-slate-400">الكمية: {product.quantity}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      <Edit className="w-3 h-3" /> تعديل
                    </button>
                    <button
                      onClick={() => handleToggleHide(product)}
                      className="btn btn-ghost btn-sm px-2"
                      title={product.isHidden ? 'إظهار' : 'إخفاء'}
                    >
                      {product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-sm px-2 text-danger-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                  <h2 className="font-bold text-slate-800">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-5 space-y-4">
                  {/* Images upload */}
                  <div className="form-group">
                    <label className="form-label">صور المنتج</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                    >
                      {uploadingImages ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      )}
                      <p className="text-xs text-slate-500">اضغط لرفع الصور</p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && handleImageUpload(e.target.files)}
                    />
                    {form.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                            <Image src={img} alt="" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">اسم المنتج (عربي) *</label>
                      <input className="form-input" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">اسم المنتج (فرنسي)</label>
                      <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                    </div>
                  </div>

                  {/* Price & Qty */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">السعر (دج) *</label>
                      <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الكمية</label>
                      <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">القسم</label>
                    <select className="form-input appearance-none" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                      <option value="">-- بدون قسم --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label">الوصف</label>
                    <textarea className="form-input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  {/* Available */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                    <span className="text-sm font-medium text-slate-700">متوفر في المخزن</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                      className={cn('transition-colors', form.isAvailable ? 'text-primary-600' : 'text-slate-300')}
                    >
                      {form.isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={saving} className="btn btn-primary w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {saving ? 'جاري الحفظ...' : editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
