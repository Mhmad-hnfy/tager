'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MapPin, ShoppingBag, Save, Loader2, FileText, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Wilaya { id: string; nameAr: string }
interface Commune { id: string; nameAr: string }

export default function RetailProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    wilayaId: '',
    communeId: '',
    address: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/wilayas').then(r => r.json()).then(d => setWilayas(d.wilayas || []))
    fetchProfile()
  }, [])

  useEffect(() => {
    if (form.wilayaId) {
      fetch(`/api/wilayas?wilayaId=${form.wilayaId}`)
        .then(r => r.json()).then(d => setCommunes(d.communes || []))
    }
  }, [form.wilayaId])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile/retail')
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setForm({
          shopName: data.profile.shopName || '',
          ownerName: data.profile.ownerName || '',
          phone: data.profile.phone || '',
          wilayaId: data.profile.wilayaId || '',
          communeId: data.profile.communeId || '',
          address: data.profile.address || '',
          description: data.profile.description || '',
        })
      }
    } finally { setLoading(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile/retail', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ'); return }
      toast.success('تم حفظ التغييرات')
      setEditing(false)
      fetchProfile()
    } catch { toast.error('حدث خطأ') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">ملفي الشخصي</h1>
          <p className="section-subtitle">معلومات محلك وحسابك</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-sm border-2 border-danger-200 text-danger-600 hover:bg-red-50">
            <Edit2 className="w-4 h-4" /> تعديل
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-danger-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">{profile?.shopName}</h2>
            <p className="text-slate-500 text-sm">{profile?.ownerName}</p>
            <span className="badge bg-red-50 text-danger-600 text-xs mt-1">تاجر تجزئة</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">اسم المحل</label>
              <div className="relative">
                <ShoppingBag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`form-input pr-9 ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                  value={form.shopName}
                  onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">اسم المسؤول</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`form-input pr-9 ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                  value={form.ownerName}
                  onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={`form-input pr-9 ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                disabled={!editing}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">الولاية</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className={`form-input pr-9 appearance-none ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                  value={form.wilayaId}
                  onChange={e => setForm(f => ({ ...f, wilayaId: e.target.value, communeId: '' }))}
                  disabled={!editing}
                >
                  <option value="">-- اختر --</option>
                  {wilayas.map(w => <option key={w.id} value={w.id}>{w.nameAr}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">البلدية</label>
              <select
                className={`form-input appearance-none ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                value={form.communeId}
                onChange={e => setForm(f => ({ ...f, communeId: e.target.value }))}
                disabled={!editing || communes.length === 0}
              >
                <option value="">-- اختر --</option>
                {communes.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">العنوان</label>
            <input
              className={`form-input ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              disabled={!editing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">وصف المحل</label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                className={`form-input pr-9 resize-none ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                disabled={!editing}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-medium">رقم الحساب:</span>
              <span dir="ltr">{session?.user?.phone}</span>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="btn flex-1 bg-danger-600 text-white hover:bg-danger-700 active:scale-95 shadow-danger">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button type="button" onClick={() => { setEditing(false); fetchProfile() }} className="btn btn-ghost">
                إلغاء
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
