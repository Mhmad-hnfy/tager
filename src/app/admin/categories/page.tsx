'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, FolderOpen, Loader2, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  nameAr: string
  nameFr?: string
  icon?: string
  isGlobal: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [catToDelete, setCatToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ nameAr: '', nameFr: '', icon: '', isGlobal: true })

  const fetchCats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories?global=true')
      const data = await res.json()
      setCategories(data.categories || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCats() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nameAr) return
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isGlobal: true }),
      })
      if (res.ok) { toast.success('تمت إضافة القسم العام ✅'); setShowModal(false); fetchCats() }
      else { const d = await res.json(); toast.error(d.error || 'خطأ في الحفظ') }
    } finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!catToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories?id=${catToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم الحذف بنجاح ✅')
        setCatToDelete(null)
        fetchCats()
      } else {
        const data = await res.json()
        toast.error(data.error || 'لا يمكن حذف قسم يحتوي على منتجات')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="page-header flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-xl sm:text-2xl font-black">إدارة الأقسام العامة</h1>
          <p className="section-subtitle text-xs sm:text-sm">الأقسام المتاحة لجميع تجار الجملة في المنصة</p>
        </div>
        <button
          onClick={() => { setForm({ nameAr: '', nameFr: '', icon: '', isGlobal: true }); setShowModal(true) }}
          className="btn btn-primary btn-sm sm:btn-md"
        >
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : categories.length === 0 ? (
        <div className="card py-16 text-center text-slate-400">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-sm">لا توجد أقسام عامة مسجلة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 group relative hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-2 text-center">{cat.icon || '📦'}</div>
                <div className="font-bold text-slate-800 text-sm text-center truncate">{cat.nameAr}</div>
                {cat.nameFr && <div className="text-xs text-slate-400 text-center mt-0.5 truncate">{cat.nameFr}</div>}
              </div>
              <div className="flex justify-center gap-2 mt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setCatToDelete(cat)}
                  className="p-1.5 text-danger-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف القسم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center sm:p-0">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 sm:p-5 text-right my-auto border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="font-bold text-slate-800 text-base">إضافة قسم عام</h2>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الاسم بالعربية *</label>
                    <input
                      className="form-input"
                      value={form.nameAr}
                      onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                      placeholder="مثال: مشروبات، بهارات..."
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">Nom en français</label>
                    <input
                      className="form-input"
                      value={form.nameFr}
                      onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))}
                      dir="ltr"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الأيقونة (emoji)</label>
                    <input
                      className="form-input text-center text-2xl"
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      placeholder="🛒"
                      maxLength={4}
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      إضافة القسم
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost text-xs sm:text-sm">
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {catToDelete && (
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
                  تأكيد حذف القسم العام
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                  هل أنت متأكد من رغبتك في حذف قسم{' '}
                  <span className="font-bold text-slate-800">"{catToDelete.nameAr}"</span>؟
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
                    onClick={() => setCatToDelete(null)}
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
