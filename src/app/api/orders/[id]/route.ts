import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET single order details (for invoice and viewing)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        wholesale: {
          include: {
            wilaya: true,
            commune: true,
            user: { select: { email: true, phone: true } },
          },
        },
        retail: {
          include: {
            wilaya: true,
            commune: true,
            user: { select: { email: true, phone: true } },
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, nameAr: true, nameFr: true, images: true, price: true },
            },
          },
        },
      },
    })

    if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })

    // Validate access
    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      if (order.wholesaleId !== profile?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    } else if (session.user.role === 'RETAIL') {
      const profile = await prisma.retailProfile.findUnique({ where: { userId: session.user.id } })
      if (order.retailId !== profile?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الطلب' }, { status: 500 })
  }
}

// PATCH update order status (wholesale or admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const body = await req.json()
    const { status } = body

    const validStatuses = ['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'READY', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { retail: { include: { user: true } }, wholesale: true }
    })

    if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })

    // Validate ownership
    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      if (order.wholesaleId !== profile?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // Notify retail merchant
    const statusLabels: Record<string, string> = {
      PROCESSING: 'قيد المعالجة',
      ACCEPTED: 'تم القبول',
      REJECTED: 'تم الرفض',
      READY: 'جاهز للاستلام',
      COMPLETED: 'مكتمل',
    }

    if (order.retail?.user?.id && statusLabels[status]) {
      await prisma.notification.create({
        data: {
          userId: order.retail.user.id,
          titleAr: 'تحديث حالة الطلب',
          messageAr: `طلبك من ${order.wholesale.companyName} أصبح: ${statusLabels[status]}`,
          type: 'ORDER_STATUS_CHANGED',
          link: '/retail/dashboard/orders',
        }
      })
    }

    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 })
  }
}
