'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import {
  ShoppingBag, User, Phone, Mail, Lock, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle, ArrowRight, MapPin, Navigation, Home
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Wilaya { id: string; nameAr: string; code: string }
interface Commune { id: string; nameAr: string }

export default function RetailRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [step, setStep] = useState(1) // Step 1: account info, Step 2: location

  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    wilayaId: '',
    communeId: '',
    zoneName: '',
    address: '',
    mapUrl: '',
  })

  useEffect(() => {
    fetch('/api/wilayas').then(r => r.json()).then(d => setWilayas(d.wilayas || []))
  }, [])

  useEffect(() => {
    if (form.wilayaId) {
      setCommunes([])
      setForm(f => ({ ...f, communeId: '' }))
      fetch(`/api/wilayas?wilayaId=${form.wilayaId}`)
        .then(r => r.json()).then(d => setCommunes(d.communes || []))
    }
  }, [form.wilayaId])

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع الجغرافي')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`
        update('mapUrl', url)
        toast.success('تم تحديد موقعك بنجاح عبر GPS! 📍')
        setDetectingLocation(false)
      },
      (err) => {
        console.error(err)
        toast.error('تعذر تحديد الموقع تلقائياً. يمكنك نسخ ولصق رابط موقعك يدوياً.')
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleNextStep = (e: React.FormEvent) => {
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
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RETAIL', ...form }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }

      toast.success('تم إنشاء الحساب بنجاح! 🎉')

      const loginResult = await signIn('credentials', {
        phone: form.phone,
        password: form.password,
        redirect: false,
      })

      if (loginResult?.ok) {
        router.push('/retail/dashboard')
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
          <div className="inline-flex items-center gap-2 bg-red-50 text-danger-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ShoppingBag className="w-4 h-4" />
            حساب تاجر التجزئة
          </div>
          <h1 className="text-2xl font-bold text-slate-800">إنشاء حساب جديد</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل معلومات محلك للبدء</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === 1 ? 'bg-danger-600 text-white' : 'bg-green-100 text-green-700'}`}>
              {step === 1 ? '1' : '✓'} معلومات الحساب
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === 2 ? 'bg-danger-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              2 الموقع والمنطقة
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 sm:p-8"
        >
          {/* STEP 1: Account Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">اسم المحل *</label>
                  <div className="relative">
                    <ShoppingBag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="form-input pr-9"
                      placeholder="اسم محلك"
                      value={form.shopName}
                      onChange={e => update('shopName', e.target.value)}
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

              <button
                type="submit"
                className="btn w-full btn-lg bg-danger-600 text-white hover:bg-danger-700 active:scale-95 shadow-danger hover:shadow-lg"
              >
                التالي: الموقع والمنطقة
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Location & Zone */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Wilaya & Commune */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-danger-600" />
                  <span className="font-bold text-slate-700 text-sm">الولاية والبلدية</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">الولاية</label>
                    <select
                      className="form-input appearance-none"
                      value={form.wilayaId}
                      onChange={e => update('wilayaId', e.target.value)}
                    >
                      <option value="">-- اختر الولاية --</option>
                      {wilayas.map(w => (
                        <option key={w.id} value={w.id}>{w.code} - {w.nameAr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-xs">البلدية</label>
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
              </div>

              {/* Zone Name - Important for delivery matching */}
              <div className="form-group bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <label className="form-label mb-0 font-bold text-emerald-800">
                    منطقة محلك (مهم لجدول التوزيع) *
                  </label>
                </div>
                <input
                  className="form-input border-emerald-200 focus:border-emerald-400"
                  placeholder="مثال: المنطقة A، حي الشروق، المنطقة الصناعية..."
                  value={form.zoneName}
                  onChange={e => update('zoneName', e.target.value)}
                  required
                />
                <p className="text-xs text-emerald-700 mt-1.5">
                  📍 سيعرض لك نظام جدول تاجر الجملة اليوم الذي سيأتيك فيه بناءً على منطقتك
                </p>
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

              {/* Google Maps Location */}
              <div className="form-group bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <label className="form-label mb-0 flex items-center gap-1.5 font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-danger-600" />
                    موقع المحل على Google Maps
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="btn btn-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-danger-600 text-xs shadow-xs"
                  >
                    {detectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin text-danger-600" /> : <Navigation className="w-3.5 h-3.5 text-danger-600" />}
                    {detectingLocation ? 'جاري التحديد...' : '📍 حدد موقعي (GPS)'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="form-input pr-9 pl-14 text-xs sm:text-sm"
                    placeholder="انسخ رابط موقعك من خرائط جوجل..."
                    value={form.mapUrl}
                    onChange={e => update('mapUrl', e.target.value)}
                    dir="ltr"
                  />
                  {form.mapUrl && (
                    <a
                      href={form.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-danger-600 font-bold hover:underline bg-red-50 px-2 py-0.5 rounded-md"
                    >
                      معاينة 🗺️
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  سيتمكن موزع تاجر الجملة من الوصول لمكان محلك بدقة من خلال هذا الرابط.
                </p>
              </div>

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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-ghost flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  رجوع
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex-1 btn-lg bg-danger-600 text-white hover:bg-danger-700 active:scale-95 shadow-danger hover:shadow-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب 🎉'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-4">
            لديك حساب؟{' '}
            <Link href="/auth/login" className="text-danger-600 font-semibold hover:underline">
              سجل دخولك
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4"
        >
          <Link href="/auth/register/wholesale" className="text-slate-500 text-sm hover:text-primary-700 flex items-center justify-center gap-1">
            <ArrowRight className="w-3 h-3" />
            هل أنت تاجر جملة؟ سجل من هنا
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
