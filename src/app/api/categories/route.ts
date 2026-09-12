import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET categories (global + wholesale specific) with hierarchical support
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wholesaleId = searchParams.get('wholesaleId')
  const globalOnly = searchParams.get('global') === 'true'
  const parentId = searchParams.get('parentId') // null = root categories
  const withChildren = searchParams.get('withChildren') === 'true'

  const session = await auth()

  // Determine wholesaleId from session if not provided
  let wId = wholesaleId
  if (!wId && session?.user?.role === 'WHOLESALE') {
    const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
    wId = profile?.id || null
  }

  const whereClause: any = globalOnly
    ? { isGlobal: true }
    : {
        OR: [
          { isGlobal: true },
          ...(wId ? [{ wholesaleId: wId }] : []),
        ]
      }

  // Filter by parentId: if parentId is specified, get children. If not, get root categories (no parent)
  if (parentId === 'root' || parentId === null && searchParams.has('parentId')) {
    whereClause.parentId = null
  } else if (parentId) {
    whereClause.parentId = parentId
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    include: withChildren ? {
      children: {
        include: {
          _count: { select: { products: true } }
        },
        orderBy: { nameAr: 'asc' }
      },
      _count: { select: { products: true } }
    } : {
      _count: { select: { products: true } }
    },
    orderBy: { nameAr: 'asc' },
  })

  return NextResponse.json({ categories })
}

// POST create category (with optional parentId for subcategories)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { nameAr, nameFr, icon, isGlobal, parentId } = body

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
      parentId: parentId || null,
    },
    include: {
      children: true,
      _count: { select: { products: true } }
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

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } }
  })
  if (!category) return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 })

  if (category.isGlobal && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  if (category._count.products > 0) {
    return NextResponse.json({ error: 'لا يمكن حذف قسم يحتوي على منتجات' }, { status: 400 })
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
