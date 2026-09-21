import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Users, Package, ClipboardList, Store, ShoppingBag, TrendingUp, WifiOff, RefreshCw } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

  let wholesaleCount = 0
  let retailCount = 0
  let productCount = 0
  let orderCount = 0
  let newOrderCount = 0
  let recentOrders: any[] = []
  let dbError = false

  try {
    ;[wholesaleCount, retailCount, productCount, orderCount, newOrderCount] = await Promise.all([
      prisma.wholesaleProfile.count(),
      prisma.retailProfile.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'NEW' } }),
    ])

    recentOrders = await prisma.order.findMany({
      include: {
        retail: { select: { shopName: true } },
        wholesale: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
  } catch (err) {
    console.error('[AdminPage] DB error:', err)
    dbError = true
  }

  const stats = [
    { label: 'تجار الجملة', value: wholesaleCount, icon: Store, color: 'text-primary-700', bg: 'bg-primary-50', href: '/admin/users?role=WHOLESALE' },
    { label: 'تجار التجزئة', value: retailCount, icon: ShoppingBag, color: 'text-danger-600', bg: 'bg-red-50', href: '/admin/users?role=RETAIL' },
    { label: 'المنتجات', value: productCount, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/products' },
    { label: 'الطلبات', value: orderCount, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/orders' },
    { label: 'طلبات جديدة', value: newOrderCount, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/orders?status=NEW' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="section-title">لوحة التحكم الرئيسية</h1>
        <p className="section-subtitle">نظرة عامة على المنصة</p>
      </div>

      {dbError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <WifiOff className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">تعذّر الاتصال بقاعدة البيانات</div>
            <div className="text-xs text-red-600 mt-0.5">
              تأكد أن مشروع Supabase شغال ولم يتوقف.
            </div>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 text-xs font-medium hover:underline flex-shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة المحاولة
          </a>
        </div>
      )}

      {/* Stats Grid - 2 cols on mobile, 5 on large */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="stat-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className={`stat-icon ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-500 text-xs">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-primary-700 text-xs sm:text-sm font-semibold hover:underline">عرض الكل</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {dbError ? 'لا يمكن تحميل الطلبات حالياً' : 'لا توجد طلبات بعد'}
          </div>
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="sm:hidden divide-y divide-slate-50">
              {recentOrders.map(order => (
                <div key={order.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 text-sm">#{order.id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{order.retail.shopName}</div>
                    <div className="text-xs text-slate-400 truncate">{order.wholesale.companyName}</div>
                    <div className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</div>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {{
                      NEW: 'جديد', PROCESSING: 'معالجة', ACCEPTED: 'مقبول',
                      REJECTED: 'مرفوض', READY: 'جاهز', COMPLETED: 'مكتمل'
                    }[order.status as string]}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop: Full table */}
            <div className="hidden sm:block table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>تاجر التجزئة</th>
                    <th>تاجر الجملة</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="font-bold">#{order.id.slice(-6).toUpperCase()}</td>
                      <td>{order.retail.shopName}</td>
                      <td>{order.wholesale.companyName}</td>
                      <td>
                        <span className={`badge text-xs ${
                          order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {{
                            NEW: 'جديد', PROCESSING: 'معالجة', ACCEPTED: 'مقبول',
                            REJECTED: 'مرفوض', READY: 'جاهز', COMPLETED: 'مكتمل'
                          }[order.status as string]}
                        </span>
                      </td>
                      <td className="text-slate-400">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}