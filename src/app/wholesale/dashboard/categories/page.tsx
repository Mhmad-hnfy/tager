'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, FolderOpen, Loader2, X, Globe, Lock,
  ChevronDown, ChevronRight, FolderTree, Tag, Package, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  nameAr: string
  nameFr?: string
  icon?: string
  isGlobal: boolean
  parentId: string | null
  children?: Category[]
  _count?: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; nameAr: string } | null>(null)
  const [deletingCat, setDeletingCat] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    nameAr: '',
    nameFr: '',
    icon: '',
    parentId: '', // empty = root category
  })

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

  const openAdd = (parentId?: string) => {
    setForm({ nameAr: '', nameFr: '', icon: '', parentId: parentId || '' })
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
        body: JSON.stringify({
          nameAr: form.nameAr,
          nameFr: form.nameFr || null,
          icon: form.icon || null,
          isGlobal: false,
          parentId: form.parentId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ'); return }
      toast.success(form.parentId ? 'تم إضافة الفرع بنجاح ✅' : 'تم إضافة القسم بنجاح ✅')
      setShowModal(false)
      fetch_cats()
      // Auto-expand the parent
      if (form.parentId) {
        setExpandedIds(prev => new Set(prev).add(form.parentId))
      }
    } catch { toast.error('حدث خطأ') }
    finally { setSaving(false) }
  }

  const handleRequestDelete = (cat: { id: string; nameAr: string }, hasChildren: boolean) => {
    if (hasChildren) {
      toast.error('لا يمكن حذف قسم يحتوي على فروع. احذف الفروع أولاً.')
      return
    }
    setCategoryToDelete({ id: cat.id, nameAr: cat.nameAr })
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    setDeletingCat(true)
    try {
      const res = await fetch(`/api/categories?id=${categoryToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم الحذف بنجاح ✅')
        setCategoryToDelete(null)
        fetch_cats()
      } else {
        const data = await res.json()
        toast.error(data.error || 'لا يمكن الحذف')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeletingCat(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build tree structure
  const rootCategories = categories.filter(c => !c.parentId && !c.isGlobal)
  const globalCategories = categories.filter(c => c.isGlobal)
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">الأقسام والفروع</h1>
          <p className="section-subtitle">نظم منتجاتك في أقسام رئيسية وفروع فرعية</p>
        </div>
        <button onClick={() => openAdd()} className="btn btn-primary">
          <Plus className="w-4 h-4" /> إضافة قسم رئيسي
        </button>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-4 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <FolderTree className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-800">كيف تعمل الأقسام والفروع؟</span>
            <p className="mt-0.5 text-slate-600">
              أنشئ <b>قسماً رئيسياً</b> (مثلاً: مشروبات غازية)، ثم أضف له <b>فروعاً</b> (مثلاً: بيبسي، كوكا كولا، سبرايت...). 
              عند إضافة منتج اختر القسم الرئيسي أولاً ثم الفرع.
            </p>
          </div>
        </div>
      </div>

      {/* My Categories - Tree View */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-primary-700" />
          <h2 className="font-bold text-slate-800">أقسامي الخاصة</h2>
          <span className="badge bg-primary-50 text-primary-700">{rootCategories.length} قسم</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
        ) : rootCategories.length === 0 ? (
          <div className="empty-state py-10">
            <FolderOpen className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm">لم تضف أي أقسام بعد</p>
            <button onClick={() => openAdd()} className="btn btn-primary btn-sm mt-3">
              <Plus className="w-4 h-4" /> أضف أول قسم
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {rootCategories.map((cat, i) => {
                const children = getChildren(cat.id)
                const isExpanded = expandedIds.has(cat.id)
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    {/* Parent Row */}
                    <div className="flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50 transition-colors">
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        className="text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <span className="text-xl">{cat.icon || '📁'}</span>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm">{cat.nameAr}</div>
                        {cat.nameFr && <div className="text-xs text-slate-400">{cat.nameFr}</div>}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="badge bg-slate-100 text-slate-500 text-xs">
                          {children.length} فرع
                        </span>
                        {cat._count && cat._count.products > 0 && (
                          <span className="badge bg-primary-50 text-primary-700 text-xs flex items-center gap-1">
                            <Package className="w-3 h-3" /> {cat._count.products}
                          </span>
                        )}
                        <button
                          onClick={() => openAdd(cat.id)}
                          className="btn btn-ghost btn-sm px-2 text-xs"
                          title="إضافة فرع"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          فرع
                        </button>
                        <button
                          onClick={() => handleRequestDelete(cat, children.length > 0)}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-danger-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children / Branches */}
                    <AnimatePresence>
                      {isExpanded && children.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50"
                        >
                          {children.map(child => (
                            <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100/70 last:border-0 hover:bg-slate-100/50 transition-colors">
                              <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                <div className="w-0.5 h-full bg-slate-300 relative">
                                  <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-slate-300" />
                                </div>
                              </div>
                              <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-base">{child.icon || '🏷️'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-700">{child.nameAr}</div>
                                {child.nameFr && <div className="text-xs text-slate-400">{child.nameFr}</div>}
                              </div>
                              {child._count && child._count.products > 0 && (
                                <span className="badge bg-primary-50 text-primary-700 text-xs">
                                  <Package className="w-3 h-3 ml-0.5" /> {child._count.products} منتج
                                </span>
                              )}
                              <button
                                onClick={() => handleRequestDelete(child, false)}
                                className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-danger-500 transition-colors"
                                title="حذف الفرع"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      {isExpanded && children.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50 p-3 text-center"
                        >
                          <p className="text-xs text-slate-400">لا توجد فروع بعد</p>
                          <button onClick={() => openAdd(cat.id)} className="btn btn-ghost btn-sm mt-2 text-xs">
                            <Plus className="w-3 h-3" /> أضف أول فرع
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Global Categories (read-only) */}
      {globalCategories.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-800">الأقسام العامة</h2>
            <span className="badge bg-blue-50 text-blue-700">{globalCategories.length}</span>
            <span className="text-xs text-slate-400 mr-1">(يديرها الأدمن)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {globalCategories.map(cat => (
              <div key={cat.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/30 text-center">
                <div className="text-2xl mb-2">{cat.icon || '📦'}</div>
                <div className="font-semibold text-slate-700 text-sm">{cat.nameAr}</div>
                {cat.nameFr && <div className="text-xs text-slate-400 mt-0.5">{cat.nameFr}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-auto text-right overflow-hidden border border-slate-100"
              >
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                      {form.parentId ? 'إضافة فرع جديد' : 'إضافة قسم رئيسي جديد'}
                    </h2>
                    {form.parentId && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        فرع من: {categories.find(c => c.id === form.parentId)?.nameAr}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">{form.parentId ? 'اسم الفرع (عربي)' : 'اسم القسم (عربي)'} *</label>
                    <input
                      className="form-input"
                      placeholder={form.parentId ? 'مثال: بيبسي، كوكا كولا...' : 'مثال: مشروبات غازية، مواد غذائية...'}
                      value={form.nameAr}
                      onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الاسم بالفرنسية</label>
                    <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الأيقونة (emoji)</label>
                    <input
                      className="form-input text-center text-2xl"
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      placeholder={form.parentId ? '🏷️' : '📦'}
                      maxLength={4}
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {form.parentId ? 'إضافة الفرع' : 'إضافة القسم'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost text-xs sm:text-sm">
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
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
                  تأكيد حذف القسم / الفرع
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                  هل أنت متأكد من رغبتك في حذف{' '}
                  <span className="font-bold text-slate-800">"{categoryToDelete.nameAr}"</span>؟
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingCat}
                    className="btn btn-sm sm:btn-md bg-danger-600 hover:bg-danger-700 text-white font-bold flex-1 shadow-danger"
                  >
                    {deletingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>{deletingCat ? 'جاري الحذف...' : 'نعم، احذف'}</span>
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(null)}
                    disabled={deletingCat}
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
