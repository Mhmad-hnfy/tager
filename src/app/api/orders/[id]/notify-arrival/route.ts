import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const minutes = Number(body?.minutes) || 60
    const customNote = body?.customNote?.trim() || ''
    const setStatusOutForDelivery = body?.setStatusOutForDelivery !== false

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        retail: { include: { user: true } },
        wholesale: { include: { user: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Validate ownership (Wholesale merchant or Admin)
    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      if (order.wholesaleId !== profile?.id) {
        return NextResponse.json({ error: 'غير مصرح لك بإدارة هذا الطلب' }, { status: 403 })
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (!order.retail?.user?.id) {
      return NextResponse.json({ error: 'حساب تاجر التجزئة غير متوفر لإرسال الإشعار' }, { status: 400 })
    }

    const orderNum = generateOrderNumber(order.id)
    const timeText = minutes === 60 ? 'ساعة' : minutes === 30 ? 'نصف ساعة' : `${minutes} دقيقة`
    
    // Notification message
    const titleAr = `🚚 تاجر الجملة في الطريق إليك (الوصول خلال ${timeText})!`
    const titleFr = `Le grossiste arrive dans ${minutes} minutes!`
    
    let messageAr = `تذكير: تاجر الجملة (${order.wholesale.companyName}) في طريقه إليك لتسليم طلبك ${orderNum}، ومن المتوقع وصوله خلال ${timeText} تقريباً.`
    if (customNote) {
      messageAr += `\nملاحظة من التاجر: "${customNote}"`
    }
    messageAr += ` يرجى التواجد والاستعداد للاستلام.`

    // 1. Create In-App Notification
    const notification = await prisma.notification.create({
      data: {
        userId: order.retail.user.id,
        titleAr,
        titleFr,
        messageAr,
        type: 'DELIVERY_REMINDER',
        link: '/retail/dashboard/orders',
      },
    })

    // 2. Format a WhatsApp message and link for convenient direct messaging
    let cleanPhone = (order.retail.phone || '').replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.slice(1)
    }
    const whatsappMsg = `السلام عليكم ورحمة الله،\nمعك تاجر الجملة (${order.wholesale.companyName}).\nأعلمكم أنني في الطريق إليكم لتسليم الطلبية رقم ${orderNum}، ومن المتوقع وصولي خلال ${timeText} إن شاء الله 🚚📦.\n${customNote ? `ملاحظة: ${customNote}\n` : ''}يرجى التواجد والاستعداد.`
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}` : null

    // 3. Optionally update order status to OUT_FOR_DELIVERY
    const shouldUpdateStatus = setStatusOutForDelivery && ['ACCEPTED', 'READY', 'PROCESSING'].includes(order.status)
    const now = new Date()
    const timeStampStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const reminderLog = `[تذكير وصول: أُرسل إشعار بالوصول خلال ${timeText} في ${timeStampStr}]`

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(shouldUpdateStatus ? { status: 'OUT_FOR_DELIVERY' } : {}),
        notes: order.notes ? `${order.notes}\n${reminderLog}` : reminderLog,
      },
    })

    return NextResponse.json({
      success: true,
      message: `تم إرسال إشعار الوصول (خلال ${timeText}) إلى تاجر التجزئة بنجاح 🔔`,
      notification,
      order: updatedOrder,
      whatsappUrl,
    })
  } catch (err: any) {
    console.error('Error notifying arrival:', err)
    return NextResponse.json({ error: err?.message || 'خطأ أثناء إرسال إشعار التذكير' }, { status: 500 })
  }
}
