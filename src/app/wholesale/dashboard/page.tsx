import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WholesaleDashboardClient } from './WholesaleDashboardClient'

export default async function WholesaleDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const profile = await prisma.wholesaleProfile.findUnique({
    where: { userId: session.user.id },
    include: { wilaya: true, commune: true }
  })

  if (!profile) redirect('/auth/login')

  const [productCount, orderCounts] = await Promise.all([
    prisma.product.count({ where: { wholesaleId: profile.id } }),
    prisma.order.groupBy({
      by: ['status'],
      where: { wholesaleId: profile.id },
      _count: true,
    }),
  ])

  const recentOrders = await prisma.order.findMany({
    where: { wholesaleId: profile.id },
    include: {
      retail: { select: { shopName: true, ownerName: true } },
      items: { include: { product: { select: { nameAr: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const counts = {
    total: orderCounts.reduce((s, o) => s + o._count, 0),
    new: orderCounts.find(o => o.status === 'NEW')?._count || 0,
    processing: orderCounts.find(o => o.status === 'PROCESSING')?._count || 0,
    accepted: orderCounts.find(o => o.status === 'ACCEPTED')?._count || 0,
    completed: orderCounts.find(o => o.status === 'COMPLETED')?._count || 0,
  }

  return (
    <WholesaleDashboardClient
      profile={JSON.parse(JSON.stringify(profile))}
      productCount={productCount}
      orderCounts={counts}
      recentOrders={JSON.parse(JSON.stringify(recentOrders))}
    />
  )
}
