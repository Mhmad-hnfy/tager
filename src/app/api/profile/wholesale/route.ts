import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const profile = await prisma.wholesaleProfile.findUnique({
    where: { userId: session.user.id },
    include: { wilaya: true, commune: true },
  })

  return NextResponse.json({ profile })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { companyName, ownerName, phone, wilayaId, communeId, address, description } = body

  const profile = await prisma.wholesaleProfile.update({
    where: { userId: session.user.id },
    data: {
      companyName,
      ownerName,
      phone,
      wilayaId: wilayaId || null,
      communeId: communeId || null,
      address,
      description,
    },
  })

  return NextResponse.json({ profile })
}
