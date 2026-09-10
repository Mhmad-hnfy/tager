import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET wholesale merchants (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const wilayaId = searchParams.get('wilayaId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const merchants = await prisma.wholesaleProfile.findMany({
    where: {
      user: { status: 'ACTIVE' },
      ...(wilayaId ? { wilayaId } : {}),
      ...(search ? {
        OR: [
          { companyName: { contains: search } },
          { description: { contains: search } },
        ]
      } : {}),
    },
    include: {
      wilaya: true,
      commune: true,
      categories: { where: { isGlobal: false }, take: 5 },
      _count: { select: { products: { where: { isAvailable: true, isHidden: false } } } }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.wholesaleProfile.count({
    where: {
      user: { status: 'ACTIVE' },
      ...(wilayaId ? { wilayaId } : {}),
    }
  })

  return NextResponse.json({ merchants, total, page, limit })
}
