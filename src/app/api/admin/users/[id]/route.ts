import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const body = await req.json()
  const { status } = body

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  // Prevent admin from deleting their own account
  if (session.user.id === params.id) {
    return NextResponse.json({ error: 'لا يمكنك حذف حساب المدير الحالي' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'تم حذف الحساب وجميع البيانات المرتبطة به بنجاح' })
  } catch (err) {
    console.error('Error deleting user:', err)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الحساب. يرجى المحاولة لاحقاً.' }, { status: 500 })
  }
}
