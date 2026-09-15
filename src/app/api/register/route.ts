import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const wholesaleSchema = z.object({
  companyName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6),
  wilayaId: z.string().optional(),
  communeId: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  mapUrl: z.string().optional().or(z.literal('')),
})

const retailSchema = z.object({
  shopName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6),
  wilaya: z.string().optional(),
  wilayaName: z.string().optional(),
  wilayaId: z.string().optional(),
  communeId: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  mapUrl: z.string().optional().or(z.literal('')),
  zoneName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, ...data } = body

    // Check phone uniqueness
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (existing) {
      return NextResponse.json({ error: 'رقم الهاتف مسجل مسبقاً' }, { status: 400 })
    }

    const cleanEmail = data.email && data.email.trim() ? data.email.toLowerCase().trim() : null
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } })
      if (existingEmail) {
        return NextResponse.json({ error: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 400 })
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    if (type === 'WHOLESALE') {
      const parsed = wholesaleSchema.safeParse(data)
      if (!parsed.success) return NextResponse.json({ error: 'البيانات غير صحيحة' }, { status: 400 })

      const user = await prisma.user.create({
        data: {
          phone: data.phone,
          email: cleanEmail,
          password: hashedPassword,
          role: 'WHOLESALE',
          wholesaleProfile: {
            create: {
              companyName: data.companyName,
              ownerName: data.ownerName,
              phone: data.phone,
              wilayaId: data.wilayaId || null,
              communeId: data.communeId || null,
              address: data.address || null,
              description: data.description || null,
              mapUrl: data.mapUrl || null,
            }
          }
        }
      })
      return NextResponse.json({ success: true, userId: user.id })
    }

    if (type === 'RETAIL') {
      const parsed = retailSchema.safeParse(data)
      if (!parsed.success) return NextResponse.json({ error: 'البيانات غير صحيحة' }, { status: 400 })

      // Match or resolve typed wilaya
      let matchedWilayaId: string | null = data.wilayaId || null
      const typedWilaya = (data.wilaya || data.wilayaName || '').trim()

      if (!matchedWilayaId && typedWilaya) {
        const cleanedWilaya = typedWilaya.replace(/^ولاية\s+/i, '').trim()
        const found = await prisma.wilaya.findFirst({
          where: {
            OR: [
              { nameAr: { contains: cleanedWilaya, mode: 'insensitive' } },
              { nameFr: { contains: cleanedWilaya, mode: 'insensitive' } },
              { code: cleanedWilaya },
            ]
          }
        })

        if (found) {
          matchedWilayaId = found.id
        } else {
          try {
            const randomCode = 'W' + Math.floor(1000 + Math.random() * 9000)
            const created = await prisma.wilaya.create({
              data: {
                nameAr: cleanedWilaya,
                nameFr: cleanedWilaya,
                code: randomCode,
              }
            })
            matchedWilayaId = created.id
          } catch (e) {
            console.error('Auto-create wilaya error:', e)
          }
        }
      }

      const user = await prisma.user.create({
        data: {
          phone: data.phone,
          email: cleanEmail,
          password: hashedPassword,
          role: 'RETAIL',
          retailProfile: {
            create: {
              shopName: data.shopName,
              ownerName: data.ownerName,
              phone: data.phone,
              wilayaId: matchedWilayaId,
              communeId: null,
              address: null,
              description: data.description || null,
              mapUrl: data.mapUrl || null,
              zoneName: data.zoneName || null,
            }
          }
        }
      })
      return NextResponse.json({ success: true, userId: user.id })
    }

    return NextResponse.json({ error: 'نوع الحساب غير صحيح' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 })
  }
}
