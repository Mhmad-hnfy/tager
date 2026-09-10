import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const body = await req.json()
  const { nameAr, nameFr, wilayaId } = body

  if (!nameAr || !wilayaId) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })

  const commune = await prisma.commune.create({
    data: { nameAr, nameFr: nameFr || nameAr, wilayaId }
  })

  return NextResponse.json({ commune })
}
