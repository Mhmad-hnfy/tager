import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const role = searchParams.get('role')

  const users = await prisma.user.findMany({
    where: {
      role: role ? (role as any) : { in: ['WHOLESALE', 'RETAIL'] },
      ...(search ? {
        OR: [
          { phone: { contains: search } },
          { email: { contains: search } },
          { wholesaleProfile: { companyName: { contains: search } } },
          { retailProfile: { shopName: { contains: search } } },
        ]
      } : {}),
    },
    include: {
      wholesaleProfile: {
        include: {
          wilaya: true,
          commune: true,
          deliverySchedules: {
            include: { wilaya: true },
            orderBy: { dayOfWeek: 'asc' },
          },
          _count: {
            select: { products: true, orders: true },
          },
        },
      },
      retailProfile: {
        include: {
          wilaya: true,
          commune: true,
          _count: {
            select: { orders: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}
