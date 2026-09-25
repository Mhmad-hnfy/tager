'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, Building2,
  Save, Loader2, FileText, Edit2, Lock, Eye, EyeOff, CheckCircle, X, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Wilaya { id: string; nameAr: string }
interface Commune { id: string; nameAr: string }

export default function WholesaleProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    phone: '',
    wilayaId: '',
    communeId: '',
    address: '',
    description: '',
  })

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'خطأ في رفع الشعار')
        return
      }
      if (data.paths?.[0]) {
        const logoUrl = data.paths[0]
        await fetch('/api/profile/wholesale', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo: logoUrl }),
        })
        setProfile((prev: any) => ({ ...prev, logo: logoUrl }))
        toast.success('تم تحديث شعار المتجر بنجاح 🎉')
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الشعار')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Password change form
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
      const res = await fetch('/api/profile/wholesale')
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setForm({
          companyName: data.profile.companyName || '',
          ownerName: data.profile.ownerName || '',
          phone: data.profile.phone || '',
          wilayaId: data.profile.wilayaId || '',
          communeId: data.profile.communeId || '',
          address: data.profile.address || '',
          description: data.profile.description || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطأ في الحفظ'); return }
      toast.success('تم حفظ التغييرات بنجاح ✅')
      setEditing(false)
      fetchProfile()
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('كلمتا المرور الجديدتان غير متطابقتان')
      return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
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
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">ملفي الشخصي</h1>
          <p className="section-subtitle">إدارة معلومات حسابك</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-ghost btn-sm"
          >
            <Lock className="w-4 h-4" /> تغيير كلمة المرور
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
              <Edit2 className="w-4 h-4" /> تعديل
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        {/* Logo/Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()} title="اضغط لتغيير الشعار">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-200 group-hover:border-primary-500 transition-colors shadow-2xs">
              {uploadingLogo ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              ) : profile?.logo ? (
                <Image src={profile.logo} alt="logo" width={80} height={80} unoptimized className="object-cover w-full h-full" />
              ) : (
                <Building2 className="w-10 h-10 text-primary-600" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-2xs font-bold gap-0.5">
              <Camera className="w-4 h-4" />
              <span>تغيير</span>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">{profile?.companyName}</h2>
            <p className="text-slate-500 text-sm">{profile?.ownerName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="badge bg-primary-50 text-primary-700 text-xs">تاجر جملة</span>
              {profile?.isVerified && (
                <span className="badge bg-green-50 text-green-700 text-xs">✓ موثق</span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">اسم الشركة / المحل</label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`form-input pr-9 ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
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
              placeholder="الحي، الشارع..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">وصف النشاط التجاري</label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                className={`form-input pr-9 resize-none ${!editing ? 'bg-slate-50 text-slate-500' : ''}`}
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                disabled={!editing}
                placeholder="وصف مختصر عن نشاطك التجاري..."
              />
            </div>
          </div>

          {/* Read-only info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-medium">رقم الحساب:</span>
              <span dir="ltr">{session?.user?.phone}</span>
            </div>
            {session?.user?.email && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">البريد الإلكتروني:</span>
                <span dir="ltr">{session.user.email}</span>
              </div>
            )}
          </div>

          {editing && (
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); fetchProfile() }}
                className="btn btn-ghost"
              >
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
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">تغيير كلمة المرور</h3>
                  </div>
                  <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                  {/* Current Password */}
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

                  {/* New Password */}
                  <div className="form-group">
                    <label className="form-label">كلمة المرور الجديدة *</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className="form-input pr-9 pl-9"
                        type={showPw.new ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                        required
                        minLength={6}
                        placeholder="6 أحرف على الأقل"
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
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
                    <button type="submit" disabled={savingPw} className="btn btn-primary flex-1">
                      {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {savingPw ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                    </button>
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-ghost">
                      إلغاء
                    </button>
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
