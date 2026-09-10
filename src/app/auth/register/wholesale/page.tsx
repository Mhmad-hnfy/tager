'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import {
  Building2, User, Phone, Mail, MapPin, Lock, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle, ArrowRight, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Wilaya { id: string; nameAr: string; code: string }
interface Commune { id: string; nameAr: string }

export default function WholesaleRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])

  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    wilayaId: '',
    communeId: '',
    address: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/wilayas').then(r => r.json()).then(d => setWilayas(d.wilayas || []))
  }, [])

  useEffect(() => {
    if (form.wilayaId) {
      fetch(`/api/wilayas?wilayaId=${form.wilayaId}`)
        .then(r => r.json())
        .then(d => setCommunes(d.communes || []))
      setForm(f => ({ ...f, communeId: '' }))
    }
  }, [form.wilayaId])

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'WHOLESALE', ...form }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }

      toast.success('تم إنشاء الحساب بنجاح! 🎉')

      // Auto-login after registration
      const loginResult = await signIn('credentials', {
        phone: form.phone,
        password: form.password,
        redirect: false,
      })

      if (loginResult?.ok) {
        router.push('/wholesale/dashboard')
      } else {
        router.push('/auth/login')
      }
    } catch {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="تجارنا" width={40} height={40} className="rounded-xl" onError={(e: any) => { e.target.style.display = 'none' }} />
            <span className="text-xl font-black text-primary-700">تجارنا</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Building2 className="w-4 h-4" />
            حساب تاجر الجملة
          </div>
          <h1 className="text-2xl font-bold text-slate-800">إنشاء حساب جديد</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل معلومات محلك للبدء</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company & Owner */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">اسم الشركة / المحل *</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9"
                    placeholder="اسم شركتك أو محلك"
                    value={form.companyName}
                    onChange={e => update('companyName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">اسم المسؤول *</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9"
                    placeholder="اسمك الكامل"
                    value={form.ownerName}
                    onChange={e => update('ownerName', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">رقم الهاتف *</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9"
                    placeholder="0555 123 456"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    required
                    dir="ltr"
                    type="tel"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    type="email"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Wilaya & Commune */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">الولاية</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="form-input pr-9 appearance-none"
                    value={form.wilayaId}
                    onChange={e => update('wilayaId', e.target.value)}
                  >
                    <option value="">-- اختر الولاية --</option>
                    {wilayas.map(w => (
                      <option key={w.id} value={w.id}>{w.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">البلدية</label>
                <select
                  className="form-input appearance-none"
                  value={form.communeId}
                  onChange={e => update('communeId', e.target.value)}
                  disabled={!form.wilayaId || communes.length === 0}
                >
                  <option value="">-- اختر البلدية --</option>
                  {communes.map(c => (
                    <option key={c.id} value={c.id}>{c.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">العنوان التفصيلي</label>
              <input
                className="form-input"
                placeholder="الحي، الشارع، رقم المحل..."
                value={form.address}
                onChange={e => update('address', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">وصف النشاط</label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  className="form-input pr-9 resize-none"
                  rows={3}
                  placeholder="اكتب وصفاً مختصراً عن نشاطك التجاري..."
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">كلمة المرور *</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9 pl-9"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6 أحرف على الأقل"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور *</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9"
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    required
                  />
                  {form.confirmPassword && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {form.password === form.confirmPassword
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <AlertCircle className="w-4 h-4 text-danger-500" />
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-danger-600 bg-red-50 px-4 py-3 rounded-xl text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>

            <p className="text-center text-slate-500 text-sm">
              لديك حساب؟{' '}
              <Link href="/auth/login" className="text-primary-700 font-semibold hover:underline">
                سجل دخولك
              </Link>
            </p>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4"
        >
          <Link href="/auth/register/retail" className="text-slate-500 text-sm hover:text-danger-600 flex items-center justify-center gap-1">
            <ArrowRight className="w-3 h-3" />
            هل أنت تاجر تجزئة؟ سجل من هنا
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
