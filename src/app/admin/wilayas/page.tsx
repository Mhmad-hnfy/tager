'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Trash2, X, Loader2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Wilaya { id: string; nameAr: string; nameFr: string; code: string; communes: Commune[] }
interface Commune { id: string; nameAr: string; nameFr: string }

export default function AdminWilayasPage() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCommuneModal, setShowCommuneModal] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
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
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ'); return }
      toast.success('تمت إضافة الولاية')
      setShowModal(false)
      fetchWilayas()
    } catch { toast.error('خطأ') }
    finally { setSaving(false) }
  }

  const addCommune = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showCommuneModal) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/wilayas/communes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...communeForm, wilayaId: showCommuneModal }),
      })
      if (res.ok) {
        toast.success('تمت إضافة البلدية')
        setShowCommuneModal(null)
        fetchWilayas()
      }
    } catch { toast.error('خطأ') }
    finally { setSaving(false) }
  }

  const deleteWilaya = async (id: string) => {
    if (!confirm('حذف هذه الولاية وجميع بلدياتها؟')) return
    const res = await fetch(`/api/admin/wilayas/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('تم الحذف'); fetchWilayas() }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">إدارة الولايات والبلديات</h1>
          <p className="section-subtitle">{wilayas.length} ولاية</p>
        </div>
        <button onClick={() => { setForm({ nameAr: '', nameFr: '', code: '' }); setShowModal(true) }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> إضافة ولاية
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="space-y-3">
          {wilayas.map((wilaya, i) => (
            <motion.div key={wilaya.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(expanded === wilaya.id ? null : wilaya.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary-700" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{wilaya.nameAr}</span>
                    <span className="text-slate-400 text-xs mr-2">({wilaya.nameFr})</span>
                    <span className="badge bg-slate-100 text-slate-500 text-xs mr-1">رمز: {wilaya.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{wilaya.communes?.length || 0} بلدية</span>
                  <button onClick={e => { e.stopPropagation(); setShowCommuneModal(wilaya.id); setCommuneForm({ nameAr: '', nameFr: '' }) }}
                    className="btn btn-outline btn-sm">
                    <Plus className="w-3 h-3" /> بلدية
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteWilaya(wilaya.id) }}
                    className="p-1.5 text-danger-400 hover:text-danger-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === wilaya.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {expanded === wilaya.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 p-4">
                    {wilaya.communes?.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-2">لا توجد بلديات</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {wilaya.communes?.map(c => (
                          <span key={c.id} className="badge bg-slate-100 text-slate-600 text-xs px-3 py-1.5">
                            {c.nameAr}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Wilaya Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">إضافة ولاية</h2>
                  <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={addWilaya} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">الاسم بالعربية *</label>
                    <input className="form-input" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom en français *</label>
                    <input className="form-input" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رمز الولاية *</label>
                    <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="01" maxLength={3} required />
                  </div>
                  <button type="submit" disabled={saving} className="btn btn-primary w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Commune Modal */}
      <AnimatePresence>
        {showCommuneModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCommuneModal(null)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">إضافة بلدية</h2>
                  <button onClick={() => setShowCommuneModal(null)}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={addCommune} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">الاسم بالعربية *</label>
                    <input className="form-input" value={communeForm.nameAr} onChange={e => setCommuneForm(f => ({ ...f, nameAr: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom en français</label>
                    <input className="form-input" value={communeForm.nameFr} onChange={e => setCommuneForm(f => ({ ...f, nameFr: e.target.value }))} dir="ltr" />
                  </div>
                  <button type="submit" disabled={saving} className="btn btn-primary w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة البلدية
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
