import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const wilayaId = searchParams.get('wilayaId')
  const dayOfWeek = searchParams.get('dayOfWeek')

  try {
    const schedules = await prisma.deliverySchedule.findMany({
      where: {
        ...(wilayaId ? { wilayaId } : {}),
        ...(dayOfWeek !== null && dayOfWeek !== undefined && dayOfWeek !== '' ? { dayOfWeek: parseInt(dayOfWeek) } : {}),
      },
      include: {
        wilaya: true,
        wholesale: {
          select: {
            id: true,
            companyName: true,
            ownerName: true,
            phone: true,
            wilaya: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ schedules })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في جلب جداول التوزيع' }, { status: 500 })
  }
}
