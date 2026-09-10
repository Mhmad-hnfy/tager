import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'لم يتم اختيار ملفات' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const uploadedPaths: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) continue // 5MB limit

      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${uuidv4()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      const bytes = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      uploadedPaths.push(`/uploads/products/${filename}`)
    }

    return NextResponse.json({ paths: uploadedPaths })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطأ في رفع الصور' }, { status: 500 })
  }
}
