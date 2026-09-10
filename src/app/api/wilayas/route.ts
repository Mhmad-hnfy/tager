import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET wilayas and communes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wilayaId = searchParams.get('wilayaId')

  if (wilayaId) {
    const communes = await prisma.commune.findMany({
      where: { wilayaId },
      orderBy: { nameAr: 'asc' },
    })
    return NextResponse.json({ communes })
  }

  const wilayas = await prisma.wilaya.findMany({
    orderBy: { code: 'asc' },
  })
  return NextResponse.json({ wilayas })
}

// POST add wilaya (admin only) - handled in admin routes
export async function POST(req: NextRequest) {
  // Public for now since we'll restrict in admin panel
  const body = await req.json()
  const { nameAr, nameFr, code } = body

  const wilaya = await prisma.wilaya.create({
    data: { nameAr, nameFr, code }
  })
  return NextResponse.json({ wilaya })
}
