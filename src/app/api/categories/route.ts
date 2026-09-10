import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET categories (global + wholesale specific)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wholesaleId = searchParams.get('wholesaleId')
  const globalOnly = searchParams.get('global') === 'true'

  const categories = await prisma.category.findMany({
    where: globalOnly
      ? { isGlobal: true }
      : {
          OR: [
            { isGlobal: true },
            ...(wholesaleId ? [{ wholesaleId }] : []),
          ]
        },
    orderBy: { nameAr: 'asc' },
  })

  return NextResponse.json({ categories })
}

// POST create category
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { nameAr, nameFr, icon, isGlobal } = body

  // Only admin can create global categories
  if (isGlobal && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  let wholesaleId: string | null = null
  if (session.user.role === 'WHOLESALE') {
    const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
    wholesaleId = profile?.id || null
  }

  const category = await prisma.category.create({
    data: {
      nameAr,
      nameFr: nameFr || null,
      icon: icon || null,
      isGlobal: isGlobal || false,
      wholesaleId,
    }
  })

  return NextResponse.json({ category })
}

// DELETE category
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 })

  if (category.isGlobal && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
