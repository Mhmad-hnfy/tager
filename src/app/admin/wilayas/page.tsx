'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Trash2, ChevronDown, ChevronUp, Loader2, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Commune {
  id: string
  nameAr: string
  nameFr?: string
}

interface Wilaya {
  id: string
  nameAr: string
  nameFr: string
  code: string
  communes: Commune[]
}

export default function AdminWilayasPage() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCommuneModal, setShowCommuneModal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [wilayaToDelete, setWilayaToDelete] = useState<Wilaya | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({ nameAr: '', nameFr: '', code: '' })
  const [communeForm, setCommuneForm] = useState({ nameAr: '', nameFr: '' })

  const fetchWilayas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/wilayas')
      const data = await res.json()
      setWilayas(data.wilayas || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWilayas() }, [])

  const addWilaya = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/wilayas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('تمت إضافة الولاية ✅')
        setShowModal(false)
        fetchWilayas()
      } else {
        const d = await res.json()
        toast.error(d.error || 'خطأ في الإضافة')
      }
    } finally { setSaving(false) }
  }

  const addCommune = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showCommuneModal) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/communes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...communeForm, wilayaId: showCommuneModal }),
      })
      if (res.ok) {
        toast.success('تمت إضافة البلدية ✅')
        setShowCommuneModal(null)
        setCommuneForm({ nameAr: '', nameFr: '' })
        fetchWilayas()
      }
    } catch { toast.error('خطأ') }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!wilayaToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/wilayas/${wilayaToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف الولاية بنجاح ✅')
        setWilayaToDelete(null)
        fetchWilayas()
      } else {
        toast.error('تعذر الحذف')
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
          <h1 className="section-title text-xl sm:text-2xl font-black">إدارة الولايات والبلديات</h1>
          <p className="section-subtitle text-xs sm:text-sm">{wilayas.length} ولاية مسجلة</p>
        </div>
        <button
          onClick={() => { setForm({ nameAr: '', nameFr: '', code: '' }); setShowModal(true) }}
          className="btn btn-primary btn-sm sm:btn-md"
        >
          <Plus className="w-4 h-4" /> إضافة ولاية
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {wilayas.map((wilaya, i) => (
            <motion.div
              key={wilaya.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card overflow-hidden border border-slate-100 shadow-xs"
            >
              <div
                className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === wilaya.id ? null : wilaya.id)}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm sm:text-base">{wilaya.nameAr}</span>
                      <span className="text-xs text-slate-400 font-mono">({wilaya.code})</span>
                    </div>
                    <div className="text-xs text-slate-400">{wilaya.nameFr} · {wilaya.communes?.length || 0} بلدية</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setWilayaToDelete(wilaya) }}
                    className="p-1.5 text-danger-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف الولاية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCommuneModal(wilaya.id) }}
                    className="btn btn-ghost btn-sm text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">بلدية</span>
                  </button>
                  {expanded === wilaya.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expanded === wilaya.id && (
                <div className="border-t border-slate-100 p-3 sm:p-4 bg-slate-50/50">
                  <div className="text-xs font-semibold text-slate-500 mb-2">البلديات التابعة ({wilaya.communes?.length || 0}):</div>
                  {(!wilaya.communes || wilaya.communes.length === 0) ? (
                    <div className="text-xs text-slate-400">لا توجد بلديات مسجلة بعد</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {wilaya.communes.map(c => (
                        <span key={c.id} className="badge bg-white border border-slate-200 text-slate-700 text-xs py-1 px-2.5 shadow-2xs">
                          {c.nameAr}
                          {c.nameFr && <span className="text-slate-400 mr-1 text-[10px]">({c.nameFr})</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Wilaya Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center sm:p-0">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 sm:p-5 text-right my-auto border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="font-bold text-slate-800 text-base">إضافة ولاية</h2>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={addWilaya} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الاسم بالعربية *</label>
                    <input className="form-input" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">Nom en français *</label>
                    <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">رمز الولاية *</label>
                    <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="01" maxLength={3} required />
                  </div>
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      إضافة الولاية
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

      {/* Add Commune Modal */}
      <AnimatePresence>
        {showCommuneModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center sm:p-0">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 sm:p-5 text-right my-auto border border-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="font-bold text-slate-800 text-base">إضافة بلدية</h2>
                  <button onClick={() => setShowCommuneModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={addCommune} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">الاسم بالعربية *</label>
                    <input className="form-input" value={communeForm.nameAr} onChange={e => setCommuneForm(f => ({ ...f, nameAr: e.target.value }))} required autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs sm:text-sm">Nom en français</label>
                    <input className="form-input" value={communeForm.nameFr} onChange={e => setCommuneForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                  </div>
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-xs sm:text-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      إضافة البلدية
                    </button>
                    <button type="button" onClick={() => setShowCommuneModal(null)} className="btn btn-ghost text-xs sm:text-sm">
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
        {wilayaToDelete && (
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
                  تأكيد حذف الولاية
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                  هل أنت متأكد من حذف ولاية{' '}
                  <span className="font-bold text-slate-800">"{wilayaToDelete.nameAr}"</span>{' '}
                  وجميع البلديات التابعة لها؟
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="btn btn-sm sm:btn-md bg-danger-600 hover:bg-danger-700 text-white font-bold flex-1 shadow-danger"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>{deleting ? 'جاري الحذف...' : 'نعم، احذف الولاية'}</span>
                  </button>
                  <button
                    onClick={() => setWilayaToDelete(null)}
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
