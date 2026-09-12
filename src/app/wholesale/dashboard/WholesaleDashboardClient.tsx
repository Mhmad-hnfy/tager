'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Package, ClipboardList, TrendingUp, Clock, CheckCircle, XCircle, Star, ArrowLeft, MapPin, Truck } from 'lucide-react'
import { cn, formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, generateOrderNumber } from '@/lib/utils'

interface Props {
  profile: any
  productCount: number
  orderCounts: {
    total: number
    new: number
    processing: number
    accepted: number
    completed: number
  }
  recentOrders: any[]
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function WholesaleDashboardClient({ profile, productCount, orderCounts, recentOrders }: Props) {
  const stats = [
    {
      label: 'إجمالي المنتجات',
      value: productCount,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/wholesale/dashboard/products',
    },
    {
      label: 'طلبات جديدة',
      value: orderCounts.new,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/wholesale/dashboard/orders',
      highlight: orderCounts.new > 0,
    },
    {
      label: 'إجمالي الطلبات',
      value: orderCounts.total,
      icon: ClipboardList,
      color: 'text-primary-700',
      bg: 'bg-primary-50',
      href: '/wholesale/dashboard/orders',
    },
    {
      label: 'طلبات مكتملة',
      value: orderCounts.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/wholesale/dashboard/orders',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">مرحباً بك،</p>
          <h1 className="text-2xl font-black mb-1">{profile.companyName}</h1>
          {profile.wilaya && (
            <div className="flex items-center gap-1 text-white/70 text-sm">
              <MapPin className="w-3 h-3" />
              <span>{profile.wilaya.nameAr}{profile.commune ? ` - ${profile.commune.nameAr}` : ''}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={stat.href}
              className={cn(
                'stat-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer block',
                stat.highlight && 'ring-2 ring-orange-300 ring-offset-1'
              )}
            >
              <div className={cn('stat-icon', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <div className={cn('text-2xl font-black', stat.color)}>{stat.value}</div>
                <div className="text-slate-500 text-xs">{stat.label}</div>
              </div>
              {stat.highlight && (
                <div className="mr-auto">
                  <span className="badge bg-orange-100 text-orange-700 animate-pulse">جديد</span>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link href="/wholesale/dashboard/products" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">إدارة المنتجات</div>
            <div className="text-xs text-slate-400">إضافة وتعديل المنتجات</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-slate-500 rtl-flip" />
        </Link>

        <Link href="/wholesale/dashboard/delivery-schedule" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Truck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">جدول التوزيع</div>
            <div className="text-xs text-slate-400">مواعيد ومناطق التوصيل</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-slate-500 rtl-flip" />
        </Link>

        <Link href="/wholesale/dashboard/orders?status=NEW" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">الطلبات الجديدة</div>
            <div className="text-xs text-slate-400">{orderCounts.new} طلب في الانتظار</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-slate-500 rtl-flip" />
        </Link>

        <Link href="/wholesale/dashboard/categories" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">إدارة الأقسام</div>
            <div className="text-xs text-slate-400">تنظيم منتجاتك</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-slate-500 rtl-flip" />
        </Link>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">آخر الطلبات</h2>
            <p className="text-xs text-slate-400 mt-0.5">أحدث الطلبات الواردة</p>
          </div>
          <Link href="/wholesale/dashboard/orders" className="text-primary-700 text-sm font-semibold hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">لا توجد طلبات بعد</p>
            <p className="text-slate-400 text-sm">ستظهر الطلبات هنا عند إرسالها</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm">{generateOrderNumber(order.id)}</span>
                      <span className={cn('badge', getOrderStatusColor(order.status))}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.retail.shopName} • {order.items.length} منتج
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-sm">{formatPrice(order.total)}</div>
                    <div className="text-xs text-slate-400">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
