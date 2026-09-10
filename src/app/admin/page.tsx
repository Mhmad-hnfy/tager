import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Users, Package, ClipboardList, Store, ShoppingBag, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

  const [wholesaleCount, retailCount, productCount, orderCount, newOrderCount] = await Promise.all([
    prisma.wholesaleProfile.count(),
    prisma.retailProfile.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'NEW' } }),
  ])

  const recentOrders = await prisma.order.findMany({
    include: {
      retail: { select: { shopName: true } },
      wholesale: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  const stats = [
    { label: 'تجار الجملة', value: wholesaleCount, icon: Store, color: 'text-primary-700', bg: 'bg-primary-50', href: '/admin/users?role=WHOLESALE' },
    { label: 'تجار التجزئة', value: retailCount, icon: ShoppingBag, color: 'text-danger-600', bg: 'bg-red-50', href: '/admin/users?role=RETAIL' },
    { label: 'المنتجات', value: productCount, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/products' },
    { label: 'الطلبات', value: orderCount, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/orders' },
    { label: 'طلبات جديدة', value: newOrderCount, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/orders?status=NEW' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">لوحة التحكم الرئيسية</h1>
        <p className="section-subtitle">نظرة عامة على المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="stat-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className={`stat-icon ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-500 text-xs">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-primary-700 text-sm font-semibold hover:underline">عرض الكل</Link>
        </div>
        <div className="table-container">
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
                      }[order.status]}
                    </span>
                  </td>
                  <td className="text-slate-400">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
