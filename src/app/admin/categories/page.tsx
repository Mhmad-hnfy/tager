'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Globe, Lock, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nameAr: '', nameFr: '', icon: '', isGlobal: true })

  const fetchCats = async () => {
    setLoading(true)
    const res = await fetch('/api/categories?global=true')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { fetchCats() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isGlobal: true }),
      })
      if (res.ok) { toast.success('تمت الإضافة'); setShowModal(false); fetchCats() }
      else { const d = await res.json(); toast.error(d.error || 'خطأ') }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا القسم؟')) return
    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('تم الحذف'); fetchCats() }
    else toast.error('خطأ في الحذف')
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">إدارة الأقسام العامة</h1>
          <p className="section-subtitle">الأقسام المتاحة لجميع تجار الجملة</p>
        </div>
        <button onClick={() => { setForm({ nameAr: '', nameFr: '', icon: '', isGlobal: true }); setShowModal(true) }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="card p-4 group relative hover:shadow-card-hover transition-all">
              <div className="text-3xl mb-2 text-center">{cat.icon || '📦'}</div>
              <div className="font-semibold text-slate-800 text-sm text-center">{cat.nameAr}</div>
              {cat.nameFr && <div className="text-xs text-slate-400 text-center mt-0.5">{cat.nameFr}</div>}
              <div className="flex justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-danger-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">إضافة قسم عام</h2>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">الاسم بالعربية *</label>
                  <input className="form-input" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom en français</label>
                  <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">الأيقونة (emoji)</label>
                  <input className="form-input text-center text-2xl" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🛒" maxLength={4} />
                </div>
                <button type="submit" disabled={saving} className="btn btn-primary w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  إضافة
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
