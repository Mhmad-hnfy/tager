import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const wilayas = await prisma.wilaya.findMany({
    include: { communes: { orderBy: { nameAr: 'asc' } } },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json({ wilayas })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const body = await req.json()
  const { nameAr, nameFr, code } = body

  if (!nameAr || !code) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })

  try {
    const wilaya = await prisma.wilaya.create({ data: { nameAr, nameFr: nameFr || nameAr, code } })
    return NextResponse.json({ wilaya })
  } catch {
    return NextResponse.json({ error: 'رمز الولاية موجود مسبقاً' }, { status: 400 })
  }
}
