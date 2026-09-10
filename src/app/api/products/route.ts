import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET products (for wholesale dashboard or retail browsing)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wholesaleId = searchParams.get('wholesaleId')
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')
  const myProducts = searchParams.get('mine') === 'true'

  const session = await auth()

  let wId = wholesaleId
  if (myProducts && session?.user?.role === 'WHOLESALE') {
    const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
    wId = profile?.id || null
  }

  const products = await prisma.product.findMany({
    where: {
      ...(wId ? { wholesaleId: wId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search ? {
        OR: [
          { nameAr: { contains: search } },
          { nameFr: { contains: search } },
        ]
      } : {}),
      // Show hidden only to the owner
      ...(myProducts ? {} : { isHidden: false }),
    },
    include: {
      category: true,
      wholesale: {
        select: { id: true, companyName: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products })
}

// POST create product (wholesale only)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'WHOLESALE') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 })

    const body = await req.json()
    const { nameAr, nameFr, description, price, quantity, categoryId, images, isAvailable } = body

    if (!nameAr || !price) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        nameAr,
        nameFr: nameFr || null,
        description: description || null,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 0,
        categoryId: categoryId || null,
        images: JSON.stringify(images || []),
        isAvailable: isAvailable !== false,
        wholesaleId: profile.id,
      },
      include: { category: true }
    })

    return NextResponse.json({ product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في إضافة المنتج' }, { status: 500 })
  }
}
