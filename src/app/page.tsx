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
      <footer className="bg-slate-900 text-white pt-14 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">تجارنا</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                المنصة الرقمية التي تجمع بين تجار الجملة وتجار التجزئة في الجزائر.
                اطلب بسهولة، وادر تجارتك بذكاء.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">روابط سريعة</h4>
              <div className="space-y-2.5">
                <Link href="/auth/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                  <span className="w-1 h-1 bg-primary-500 rounded-full" />
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register/wholesale" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                  <span className="w-1 h-1 bg-primary-500 rounded-full" />
                  تاجر الجملة
                </Link>
                <Link href="/auth/register/retail" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                  <span className="w-1 h-1 bg-primary-500 rounded-full" />
                  تاجر التجزئة
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">تواصل معنا</h4>
              <div className="space-y-3">
             
                <a
                  href="https://wa.me/213699353554"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-800 hover:bg-green-900/40 transition-colors rounded-xl px-4 py-3 group"
                >
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">واتساب</p>
                    <p className="text-sm font-bold text-white" dir="ltr">+213 699 35 35 54</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} تجارنا. جميع الحقوق محفوظة</p>
            <a href="https://www.facebook.com/share/1Jk5xE2cKL/" target="_blank" rel="noopener noreferrer">
            <p className="text-slate-500 text-sm">تصميم وبرمجة وتطوير  : <span className="text-primary-500">Mohamed Hanafy</span></p>
            </a>
            
          </div>
        </div>
      </footer>
    </div>
  )
}
