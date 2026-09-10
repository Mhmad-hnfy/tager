import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET orders
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  try {
    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      const orders = await prisma.order.findMany({
        where: {
          wholesaleId: profile!.id,
          ...(status ? { status: status as any } : {}),
        },
        include: {
          retail: { select: { shopName: true, ownerName: true, phone: true, wilaya: true } },
          items: { include: { product: { select: { nameAr: true, images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ orders })
    }

    if (session.user.role === 'RETAIL') {
      const profile = await prisma.retailProfile.findUnique({ where: { userId: session.user.id } })
      const orders = await prisma.order.findMany({
        where: {
          retailId: profile!.id,
          ...(status ? { status: status as any } : {}),
        },
        include: {
          wholesale: { select: { companyName: true, phone: true } },
          items: { include: { product: { select: { nameAr: true, images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ orders })
    }

    if (session.user.role === 'ADMIN') {
      const orders = await prisma.order.findMany({
        include: {
          retail: { select: { shopName: true } },
          wholesale: { select: { companyName: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      return NextResponse.json({ orders })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في جلب الطلبات' }, { status: 500 })
  }
}

// POST create order (retail only)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RETAIL') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items, wholesaleId, notes } = body

    if (!items?.length || !wholesaleId) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    }

    const retailProfile = await prisma.retailProfile.findUnique({ where: { userId: session.user.id } })
    if (!retailProfile) return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 })

    // Fetch products to validate
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, wholesaleId, isAvailable: true, isHidden: false },
    })

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'بعض المنتجات غير متوفرة' }, { status: 400 })
    }

    const total = items.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    const order = await prisma.order.create({
      data: {
        retailId: retailProfile.id,
        wholesaleId,
        total,
        notes: notes || null,
        status: 'NEW',
        items: {
          create: items.map((item: any) => {
            const product = products.find(p => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            }
          })
        }
      },
      include: { wholesale: true }
    })

    // Notify wholesale merchant
    const wholesaleProfile = await prisma.wholesaleProfile.findUnique({
      where: { id: wholesaleId },
      include: { user: true }
    })

    if (wholesaleProfile) {
      await prisma.notification.create({
        data: {
          userId: wholesaleProfile.userId,
          titleAr: 'طلب جديد!',
          messageAr: `تلقيت طلباً جديداً من ${retailProfile.shopName}`,
          type: 'ORDER_NEW',
          link: '/wholesale/dashboard/orders',
        }
      })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في إنشاء الطلب' }, { status: 500 })
  }
}
