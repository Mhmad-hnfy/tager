import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel cron: runs daily at 9am Algeria time (7am UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/daily-notifications", "schedule": "0 7 * * *" }] }
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== ('Bearer ' + cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active retail users
    const retailUsers = await prisma.user.findMany({
      where: { role: 'RETAIL', status: 'ACTIVE' },
      select: { id: true },
    })

    if (!retailUsers.length) {
      return NextResponse.json({ success: true, sent: 0, message: 'No retail users found' })
    }

    const messages = [
      { titleAr: String.fromCodePoint(0x1F6D2) + ' اطلب الآن من تجار الجملة!', messageAr: 'تسوق اليوم واحصل على أفضل الأسعار من تجار الجملة المتاحين. افتح التطبيق وتصفح المنتجات الآن.' },
      { titleAr: String.fromCodePoint(0x1F4E6) + ' عروض اليوم لتجار التجزئة', messageAr: 'لا تفوتك عروض اليوم! تصفح قائمة التجار والمنتجات المتاحة وقدم طلبك الآن.' },
      { titleAr: String.fromCodePoint(0x1F4B0) + ' وفر على مشترياتك اليوم', messageAr: 'ابدأ يومك بالتسوق الذكي. تجارنا يوفر لك أفضل الأسعار وأسرع التوصيل.' },
      { titleAr: String.fromCodePoint(0x1F3EA) + ' جدد مخزون محلك اليوم', messageAr: 'لا تنتظر حتى ينفد المخزون. اطلب الآن من تجار الجملة وتأكد من توفر كل ما يحتاجه محلك.' },
    ]

    const today = new Date().getDay()
    const msgTemplate = messages[today % messages.length]

    const notifications = retailUsers.map(u => ({
      userId: u.id,
      titleAr: msgTemplate.titleAr,
      messageAr: msgTemplate.messageAr,
      type: 'SYSTEM',
      link: '/retail/dashboard',
    }))

    await prisma.notification.createMany({ data: notifications })

    return NextResponse.json({ success: true, sent: notifications.length, message: ('أُرسلت ' + notifications.length + ' إشعارات للتجار') })
  } catch (err) {
    const e = err as Error
    console.error('Cron notification error:', e)
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 })
  }
}

// Also allow POST for admin manual trigger
export async function POST(req: NextRequest) {
  return GET(req)
}
