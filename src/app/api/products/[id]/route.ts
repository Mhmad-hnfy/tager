import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'WHOLESALE') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
    const product = await prisma.product.findUnique({ where: { id: params.id } })

    if (!product || product.wholesaleId !== profile?.id) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
    }

    const body = await req.json()
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        nameAr: body.nameAr ?? product.nameAr,
        nameFr: body.nameFr ?? product.nameFr,
        description: body.description ?? product.description,
        price: body.price != null ? parseFloat(body.price) : product.price,
        quantity: body.quantity != null ? parseInt(body.quantity) : product.quantity,
        categoryId: body.categoryId ?? product.categoryId,
        images: body.images ? JSON.stringify(body.images) : product.images,
        isAvailable: body.isAvailable ?? product.isAvailable,
        isHidden: body.isHidden ?? product.isHidden,
      },
      include: { category: true }
    })

    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في التعديل' }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

    // Allow wholesale owner or admin
    if (session.user.role === 'WHOLESALE') {
      const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: session.user.id } })
      if (product.wholesaleId !== profile?.id) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 })
  }
}
