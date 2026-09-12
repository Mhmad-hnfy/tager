import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET wholesale merchant's delivery schedules
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'WHOLESALE') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const profile = await prisma.wholesaleProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'الملف الشخصي لتاجر الجملة غير موجود' }, { status: 404 })
    }

    const schedules = await prisma.deliverySchedule.findMany({
      where: { wholesaleId: profile.id },
      include: { wilaya: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ schedules })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في جلب جدول التوزيع' }, { status: 500 })
  }
}

// POST create delivery schedule
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'WHOLESALE') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const profile = await prisma.wholesaleProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'الملف الشخصي لتاجر الجملة غير موجود' }, { status: 404 })
    }

    const body = await req.json()
    const { dayOfWeek, dayNameAr, wilayaId, zoneName, communeNames, notes, isActive } = body

    if (dayOfWeek === undefined || !dayNameAr || !zoneName) {
      return NextResponse.json({ error: 'يرجى ملء جميع الحقول الإلزامية (اليوم والمنطقة)' }, { status: 400 })
    }

    const schedule = await prisma.deliverySchedule.create({
      data: {
        wholesaleId: profile.id,
        dayOfWeek: parseInt(dayOfWeek),
        dayNameAr: dayNameAr.trim(),
        wilayaId: wilayaId || null,
        zoneName: zoneName.trim(),
        communeNames: communeNames?.trim() || null,
        notes: notes?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: { wilaya: true },
    })

    return NextResponse.json({ schedule, success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في إضافة منطقة التوزيع' }, { status: 500 })
  }
}
