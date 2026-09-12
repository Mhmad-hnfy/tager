import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PUT update delivery schedule
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'WHOLESALE') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const profile = await prisma.wholesaleProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 })
    }

    const existing = await prisma.deliverySchedule.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.wholesaleId !== profile.id) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا السجل' }, { status: 403 })
    }

    const body = await req.json()
    const { dayOfWeek, dayNameAr, wilayaId, zoneName, communeNames, notes, isActive } = body

    const updated = await prisma.deliverySchedule.update({
      where: { id: params.id },
      data: {
        ...(dayOfWeek !== undefined ? { dayOfWeek: parseInt(dayOfWeek) } : {}),
        ...(dayNameAr ? { dayNameAr: dayNameAr.trim() } : {}),
        ...(wilayaId !== undefined ? { wilayaId: wilayaId || null } : {}),
        ...(zoneName ? { zoneName: zoneName.trim() } : {}),
        ...(communeNames !== undefined ? { communeNames: communeNames?.trim() || null } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      include: { wilaya: true },
    })

    return NextResponse.json({ schedule: updated, success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في تعديل منطقة التوزيع' }, { status: 500 })
  }
}

// DELETE delivery schedule
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'WHOLESALE' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const existing = await prisma.deliverySchedule.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!profile || existing.wholesaleId !== profile.id) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      }
    }

    await prisma.deliverySchedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في حذف منطقة التوزيع' }, { status: 500 })
  }
}
