import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const messageType: string = body?.messageType || 'CUSTOM'
    const customMessage: string = body?.customMessage?.trim() || ''

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        retail: { include: { user: true } },
        wholesale: { include: { user: true } },
      },
    })

    if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })

    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      if (order.wholesaleId !== profile?.id)
        return NextResponse.json({ error: 'غير مصرح لك بإدارة هذا الطلب' }, { status: 403 })
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (!order.retail?.user?.id)
      return NextResponse.json({ error: 'حساب تاجر التجزئة غير متوفر' }, { status: 400 })

    const orderNum = generateOrderNumber(order.id)
    const companyName = order.wholesale.companyName

    type Tmpl = { titleAr: string; messageAr: string }
    const templates: Record<string, Tmpl> = {
      ON_THE_WAY: {
        titleAr: String.fromCodePoint(0x1F69A) + ' تاجر الجملة في الطريق إليك!',
        messageAr: 'السلام عليكم! تاجر الجملة (' + companyName + ') في طريقه إليك الآن لتسليم طلبك رقم ' + orderNum + '. يرجى التواجد والاستعداد للاستلام.',
      },
      DELAYED: {
        titleAr: String.fromCodePoint(0x23F3) + ' تأخير بسيط في التسليم',
        messageAr: 'السلام عليكم! سيتأخر تاجر الجملة (' + companyName + ') قليلاً في التسليم لطلبك رقم ' + orderNum + '. نعتذر عن أي إزعاج وسنصلكم في أقرب وقت.',
      },
      READY: {
        titleAr: String.fromCodePoint(0x2705) + ' طلبك جاهز للاستلام',
        messageAr: 'السلام عليكم! طلبك رقم ' + orderNum + ' جاهز الآن لدى تاجر الجملة (' + companyName + '). سيتم التواصل معكم قريباً لتحديد موعد التسليم.',
      },
      CUSTOM: {
        titleAr: String.fromCodePoint(0x1F4AC) + ' رسالة من تاجر الجملة (' + companyName + ')',
        messageAr: customMessage || ('رسالة بخصوص طلبك رقم ' + orderNum + '.'),
      },
    }

    const template: Tmpl = templates[messageType] || templates['CUSTOM']
    if (messageType === 'CUSTOM' && !customMessage)
      return NextResponse.json({ error: 'يرجى كتابة رسالة مخصصة' }, { status: 400 })

    const notification = await prisma.notification.create({
      data: {
        userId: order.retail.user.id,
        titleAr: template.titleAr,
        messageAr: template.messageAr,
        type: 'ORDER_STATUS_CHANGED',
        link: '/retail/dashboard/orders',
      },
    })

    let cleanPhone = (order.retail.phone || '').replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.slice(1)
    const whatsappUrl = cleanPhone
      ? ('https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(template.messageAr))
      : null

    return NextResponse.json({ success: true, message: 'تم إرسال الرسالة بنجاح', notification, whatsappUrl })
  } catch (err) {
    const e = err as Error
    return NextResponse.json({ error: e?.message || 'خطأ أثناء إرسال الرسالة' }, { status: 500 })
  }
}
