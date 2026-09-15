'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Store, ShoppingCart, Package, Users, Star,
  ArrowLeft, CheckCircle, TrendingUp, Shield, Zap, ChevronDown,
  LayoutDashboard
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } }
}

export default function HomePage() {
  const { data: session, status } = useSession()

  const dashboardHref = session?.user?.role === 'WHOLESALE'
    ? '/wholesale/dashboard'
    : session?.user?.role === 'RETAIL'
    ? '/retail/dashboard'
    : session?.user?.role === 'ADMIN'
    ? '/admin'
    : '/auth/login'

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="تجارنا" width={40} height={40} className="rounded-lg" onError={(e: any) => { e.target.style.display = 'none' }} />
            <span className="text-xl font-black text-primary-700">تجارنا</span>
          </div>
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-24 h-9 bg-slate-100 rounded-xl animate-pulse" />
            ) : session?.user ? (
              <Link href={dashboardHref} className="btn btn-primary btn-sm">
                <LayoutDashboard className="w-4 h-4" />
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost text-sm">
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register/wholesale" className="btn btn-primary btn-sm hidden sm:flex">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen hero-gradient flex items-center justify-center overflow-hidden pt-16">
        {/* Background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse-slow" />
              <Image
                src="/logo.png"
                alt="تجارنا"
                width={120}
                height={120}
                className="relative rounded-2xl shadow-2xl animate-float"
                onError={(e: any) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </motion.div>

          <motion.h1
            {...fadeInUp}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-4 leading-tight"
          >
            منصة{' '}
            <span className="text-yellow-300 drop-shadow-lg">تجارنا</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl sm:text-2xl text-white/90 mb-3 font-semibold"
          >
            من الجملة إلى محلك
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg text-white/75 mb-10 max-w-2xl mx-auto"
          >
            المنصة الرقمية التي تجمع بين تجار الجملة وتجار التجزئة في الجزائر.
            اطلب بسهولة، وادر تجارتك بذكاء.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/auth/register/wholesale"
              className="group flex items-center gap-3 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base"
            >
              <Store className="w-5 h-5" />
              <span>تاجر الجملة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl-flip" />
            </Link>
            <Link
              href="/auth/register/retail"
              className="group flex items-center gap-3 bg-danger-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-danger-700 hover:scale-105 transition-all duration-300 text-base border-2 border-white/30"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>تاجر التجزئة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl-flip" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 text-white/70 text-sm"
          >
            {/* <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> مجاني</span> */}
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> سهل الاستخدام</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-300" /> آمن</span>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Store, label: 'تاجر جملة', value: '+500', color: 'text-primary-700', bg: 'bg-primary-50' },
              { icon: ShoppingCart, label: 'تاجر تجزئة', value: '+2000', color: 'text-danger-600', bg: 'bg-red-50' },
              { icon: Package, label: 'منتج متوفر', value: '+10k', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: TrendingUp, label: 'طلب يومياً', value: '+300', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="card p-5 text-center">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">
              كيف تعمل المنصة؟
            </h2>
            <p className="text-slate-500 text-lg">خطوات بسيطة للبدء</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Wholesale */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-700 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-700">تاجر الجملة</h3>
              </div>
              {[
                'أنشئ حسابك وضيف معلومات محلك',
                'أضف منتجاتك مع الصور والأسعار',
                'نظم منتجاتك في أقسام',
                'استقبل طلبات تجار التجزئة',
                'تابع الطلبات وغير حالتها',
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-600">{step}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* For Retail */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-danger-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-danger-600">تاجر التجزئة</h3>
              </div>
              {[
                'أنشئ حسابك وأدخل معلومات محلك',
                'تصفح تجار الجملة في منطقتك',
                'ادخل على صفحة التاجر وشوف المنتجات',
                'ضيف المنتجات للطلب وحدد الكمية',
                'أرسل الطلب وتابع حالته',
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="w-8 h-8 bg-red-100 text-danger-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-600">{step}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">
              لماذا تجارنا؟
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Zap,
                title: 'سهل وسريع',
                desc: 'واجهة بسيطة تناسب جميع التجار، بدون تعقيد',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
              },
              {
                icon: Shield,
                title: 'آمن وموثوق',
                desc: 'حماية كاملة للبيانات وصلاحيات مختلفة لكل مستخدم',
                color: 'text-primary-700',
                bg: 'bg-primary-50',
              },
              {
                icon: Users,
                title: 'شبكة تجارية',
                desc: 'تواصل مباشر بين تجار الجملة والتجزئة',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Package,
                title: 'إدارة المنتجات',
                desc: 'أضف، عدل، واحذف منتجاتك بسهولة مع الصور',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: TrendingUp,
                title: 'متابعة الطلبات',
                desc: 'تابع حالة الطلبات من البداية للنهاية',
                color: 'text-danger-600',
                bg: 'bg-red-50',
              },
              {
                icon: Star,
                title: 'إشعارات فورية',
                desc: 'تنبيه فوري عند وصول طلب جديد أو تغيير حالة',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="card-hover p-6 cursor-default"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              ابدأ الآن مجاناً
            </h2>
            <p className="text-white/80 text-lg mb-8">
              انضم إلى آلاف التجار الذين يستخدمون تجارنا يومياً
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register/wholesale"
                className="bg-white text-primary-700 font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Store className="w-5 h-5" />
                تسجيل كتاجر جملة
              </Link>
              <Link
                href="/auth/register/retail"
                className="bg-danger-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-danger-700 hover:scale-105 transition-all duration-300 flex items-center gap-2 border-2 border-white/20"
              >
                <ShoppingCart className="w-5 h-5" />
                تسجيل كتاجر تجزئة
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-primary-400">تجارنا</span>
            <span className="text-slate-500 text-sm">- من الجملة إلى محلك</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <Link href="/auth/login" className="hover:text-white transition-colors">تسجيل الدخول</Link>
            <Link href="/auth/register/wholesale" className="hover:text-white transition-colors">تاجر جملة</Link>
            <Link href="/auth/register/retail" className="hover:text-white transition-colors">تاجر تجزئة</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2024 تجارنا. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
