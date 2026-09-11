'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Phone, Lock, Eye, EyeOff, AlertCircle, Loader2, Store, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة')
      } else {
        toast.success('تم تسجيل الدخول بنجاح 👋')
        // Get session to redirect based on role
        const { getSession } = await import('next-auth/react')
        const session = await getSession()
        const role = (session?.user as any)?.role

        if (role === 'WHOLESALE') {
          router.push('/wholesale/dashboard')
        } else if (role === 'RETAIL') {
          router.push('/retail/dashboard')
        } else if (role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="تجارنا" width={48} height={48} className="rounded-xl" onError={(e: any) => { e.target.style.display = 'none' }} />
              <span className="text-2xl font-black text-primary-700">تجارنا</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 mt-4">مرحباً بعودتك 👋</h1>
            <p className="text-slate-500 text-sm mt-1">سجل دخولك للمتابعة</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="form-group">
              <label className="form-label">رقم الهاتف أو البريد الإلكتروني</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="form-input pr-10"
                  placeholder="0555 123 456 أو admin@tujaruna.dz"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input pr-10 pl-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
              {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-sm">أو</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Register links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/auth/register/wholesale"
              className="flex flex-col items-center gap-2 p-4 border-2 border-slate-100 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 text-center"
            >
              <Store className="w-6 h-6 text-primary-700" />
              <span className="text-xs font-semibold text-slate-700">تاجر جملة</span>
              <span className="text-xs text-slate-400">إنشاء حساب</span>
            </Link>
            <Link
              href="/auth/register/retail"
              className="flex flex-col items-center gap-2 p-4 border-2 border-slate-100 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all duration-200 text-center"
            >
              <ShoppingCart className="w-6 h-6 text-danger-600" />
              <span className="text-xs font-semibold text-slate-700">تاجر تجزئة</span>
              <span className="text-xs text-slate-400">إنشاء حساب</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 text-center text-white p-12">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Image src="/logo.png" alt="تجارنا" width={150} height={150} className="mx-auto mb-6 rounded-2xl shadow-2xl" onError={(e: any) => { e.target.style.display = 'none' }} />
          </motion.div>
          <h2 className="text-3xl font-black mb-3">تجارنا</h2>
          <p className="text-white/80 text-lg">من الجملة إلى محلك</p>
          <div className="mt-8 space-y-3">
            {['إدارة سهلة للمنتجات', 'تواصل مباشر بين التجار', 'متابعة الطلبات لحظة بلحظة'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="flex items-center gap-3 text-white/90 text-sm"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
