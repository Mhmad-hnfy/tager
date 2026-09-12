'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, ShoppingBag, Save, Loader2, FileText,
  Edit2, Navigation, ExternalLink, Lock, Eye, EyeOff, CheckCircle, X, Home
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Wilaya { id: string; nameAr: string }
interface Commune { id: string; nameAr: string }

export default function RetailProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    wilayaId: '',
    communeId: '',
    address: '',
    zoneName: '',
    description: '',
    mapUrl: '',
  })

  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

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
          zoneName: data.profile.zoneName || '',
          description: data.profile.description || '',
          mapUrl: data.profile.mapUrl || '',
        })
      }
    } finally { setLoading(false) }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`
        setForm(f => ({ ...f, mapUrl: url }))
        toast.success('تم تحديد موقعك بدقة عبر GPS! 📍')
        setDetectingLocation(false)
      },
      (err) => {
        console.error(err)
        toast.error('تعذر تحديد الموقع تلقائياً. يمكنك نسخ الرابط ولصقه يدوياً')
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      toast.success('تم حفظ التغييرات ✅')
      setEditing(false)
      fetchProfile()
    } catch { toast.error('حدث خطأ') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('كلمتا المرور الجديدتان غير متطابقتان')
      return
    }
    setSavingPw(true)
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ'); return }
      toast.success('تم تغيير كلمة المرور بنجاح 🔒')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
    } catch { toast.error('حدث خطأ') }
    finally { setSavingPw(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">ملفي الشخصي</h1>
          <p className="section-subtitle">معلومات محلك وحسابك</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-ghost btn-sm">
            <Lock className="w-4 h-4" /> تغيير كلمة المرور
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-sm border-2 border-danger-200 text-danger-600 hover:bg-red-50">
              <Edit2 className="w-4 h-4" /> تعديل
            </button>
          )}
        </div>
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

          {/* Zone Name - Delivery matching */}
          <div className={cn('form-group p-3 rounded-xl border', editing ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-100')}>
            <label className="form-label flex items-center gap-1.5 font-bold">
              <Home className={cn('w-4 h-4', editing ? 'text-emerald-600' : 'text-slate-400')} />
              منطقة التوصيل
            </label>
            <input
              className={`form-input ${!editing ? 'bg-slate-50 text-slate-500' : 'border-emerald-200 focus:border-emerald-400'}`}
              value={form.zoneName}
              onChange={e => setForm(f => ({ ...f, zoneName: e.target.value }))}
              disabled={!editing}
              placeholder="مثال: المنطقة A، حي الشروق..."
            />
            {editing && (
              <p className="text-xs text-emerald-700 mt-1">
                📍 يُستخدم هذا الحقل لمطابقة منطقتك مع جدول توزيع تاجر الجملة
              </p>
            )}
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

          {/* Google Maps Location */}
          <div className="form-group bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <label className="form-label mb-0 flex items-center gap-1.5 font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-danger-600" />
                موقع المحل على Google Maps
              </label>
              <div className="flex items-center gap-2">
                {editing && (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="btn btn-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-danger-600 text-xs shadow-xs"
                  >
                    {detectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin text-danger-600" /> : <Navigation className="w-3.5 h-3.5 text-danger-600" />}
                    {detectingLocation ? 'جاري التحديد...' : '📍 تحديد تلقائي (GPS)'}
                  </button>
                )}
                {form.mapUrl && (
                  <a
                    href={form.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-danger-50 text-danger-700 hover:bg-danger-100 text-xs flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    فتح على الخريطة
                  </a>
                )}
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={`form-input pr-9 ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder={editing ? "ألصق رابط الموقع من Google Maps أو اضغط تحديد تلقائي" : "لم يتم تحديد موقع على الخريطة بعد"}
                value={form.mapUrl}
                onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                disabled={!editing}
                dir="ltr"
              />
            </div>
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

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-danger-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">تغيير كلمة المرور</h3>
                  </div>
                  <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                  <div className="form-group">
                    <label className="form-label">كلمة المرور الحالية *</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className="form-input pr-9 pl-9"
                        type={showPw.current ? 'text' : 'password'}
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                        required
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">كلمة المرور الجديدة *</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className="form-input pr-9 pl-9"
                        type={showPw.new ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                        required minLength={6}
                        placeholder="6 أحرف على الأقل"
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">تأكيد كلمة المرور الجديدة *</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className="form-input pr-9 pl-9"
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        required
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {pwForm.confirmPassword && (
                        <div className={cn('absolute left-9 top-1/2 -translate-y-1/2',
                          pwForm.newPassword === pwForm.confirmPassword ? 'text-green-500' : 'text-danger-500'
                        )}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={savingPw} className="btn flex-1 bg-danger-600 text-white hover:bg-danger-700">
                      {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {savingPw ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                    </button>
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-ghost">إلغاء</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
