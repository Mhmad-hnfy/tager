'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit, FolderOpen, Loader2, X, Globe, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  nameAr: string
  nameFr?: string
  icon?: string
  isGlobal: boolean
  _count?: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nameAr: '', nameFr: '', icon: '' })

  const fetch_cats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_cats() }, [])

  const openAdd = () => {
    setEditingCat(null)
    setForm({ nameAr: '', nameFr: '', icon: '' })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nameAr) { toast.error('اسم القسم مطلوب'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isGlobal: false }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ'); return }
      toast.success('تم إضافة القسم')
      setShowModal(false)
      fetch_cats()
    } catch { toast.error('حدث خطأ') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return
    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('تم حذف القسم'); fetch_cats() }
    else toast.error('لا يمكن حذف هذا القسم')
  }

  const myCategories = categories.filter(c => !c.isGlobal)
  const globalCategories = categories.filter(c => c.isGlobal)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">الأقسام</h1>
          <p className="section-subtitle">تنظيم منتجاتك في أقسام</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {/* My Categories */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-primary-700" />
          <h2 className="font-bold text-slate-800">أقسامي الخاصة</h2>
          <span className="badge bg-primary-50 text-primary-700">{myCategories.length}</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
        ) : myCategories.length === 0 ? (
          <div className="empty-state py-10">
            <FolderOpen className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm">لم تضيف أي أقسام بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {myCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-slate-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
                >
                  <div className="text-2xl mb-2">{cat.icon || '📦'}</div>
                  <div className="font-semibold text-slate-800 text-sm">{cat.nameAr}</div>
                  {cat.nameFr && <div className="text-xs text-slate-400 mt-0.5">{cat.nameFr}</div>}
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="mt-2 text-danger-400 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Global Categories */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800">الأقسام العامة</h2>
          <span className="badge bg-blue-50 text-blue-700">{globalCategories.length}</span>
          <span className="text-xs text-slate-400 mr-1">(يديرها الأدمن)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {globalCategories.map(cat => (
            <div key={cat.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
              <div className="text-2xl mb-2">{cat.icon || '📦'}</div>
              <div className="font-semibold text-slate-700 text-sm">{cat.nameAr}</div>
              {cat.nameFr && <div className="text-xs text-slate-400 mt-0.5">{cat.nameFr}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-800">إضافة قسم جديد</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4">
                  <div className="form-group">
                    <label className="form-label">اسم القسم (عربي) *</label>
                    <input className="form-input" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم القسم (فرنسي)</label>
                    <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الأيقونة (emoji)</label>
                    <input className="form-input text-center text-2xl" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🛒" maxLength={4} />
                  </div>
                  <button type="submit" disabled={saving} className="btn btn-primary w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة القسم
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
