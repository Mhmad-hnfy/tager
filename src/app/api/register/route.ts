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
})

const retailSchema = z.object({
  shopName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6),
  wilayaId: z.string().optional(),
  communeId: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
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
            }
          }
        }
      })
      return NextResponse.json({ success: true, userId: user.id })
    }

    if (type === 'RETAIL') {
      const parsed = retailSchema.safeParse(data)
      if (!parsed.success) return NextResponse.json({ error: 'البيانات غير صحيحة' }, { status: 400 })

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
              wilayaId: data.wilayaId || null,
              communeId: data.communeId || null,
              address: data.address || null,
              description: data.description || null,
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
