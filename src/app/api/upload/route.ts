import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'avif', 'heic', 'heif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function getMimeType(ext: string, fallback: string): string {
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    avif: 'image/avif',
  }
  return mimeMap[ext.toLowerCase()] || fallback || 'image/jpeg'
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول أولاً' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    // Support both 'files' array and single 'file'
    let rawFiles = formData.getAll('files')
    if (rawFiles.length === 0) {
      const single = formData.get('file')
      if (single) rawFiles = [single]
    }

    if (!rawFiles || rawFiles.length === 0) {
      return NextResponse.json({ error: 'لم يتم اختيار ملفات للرفع' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const uploadedPaths: string[] = []
    let oversizedCount = 0
    let invalidTypeCount = 0

    for (const item of rawFiles) {
      if (!item || typeof item === 'string' || typeof (item as File).arrayBuffer !== 'function') {
        continue
      }

      const file = item as File
      const ext = (file.name ? file.name.split('.').pop() || 'jpg' : 'jpg').toLowerCase()
      const isImageMime = file.type && file.type.startsWith('image/')
      const isAllowedExt = ALLOWED_EXTS.includes(ext)

      if (!isImageMime && !isAllowedExt) {
        invalidTypeCount++
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        oversizedCount++
        continue
      }

      const filename = `${uuidv4()}.${ext}`
      const contentType = getMimeType(ext, file.type)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      let uploadSuccess = false

      // 1. Try uploading to Supabase Storage if configured (production & cloud-ready)
      if (supabaseUrl && supabaseServiceKey) {
        try {
          const uploadEndpoint = `${supabaseUrl}/storage/v1/object/products/${filename}`
          const uploadRes = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey,
              'Content-Type': contentType,
              'x-upsert': 'true',
            },
            body: buffer,
          })

          if (uploadRes.ok) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${filename}`
            uploadedPaths.push(publicUrl)
            uploadSuccess = true
          } else {
            console.error('Supabase upload returned error status:', uploadRes.status, await uploadRes.text())
          }
        } catch (supabaseErr) {
          console.error('Supabase upload exception:', supabaseErr)
        }
      }

      // 2. Fallback to local filesystem storage if Supabase failed or not configured
      if (!uploadSuccess) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
          await mkdir(uploadDir, { recursive: true })
          const filepath = path.join(uploadDir, filename)
          await writeFile(filepath, buffer)
          uploadedPaths.push(`/uploads/products/${filename}`)
          uploadSuccess = true
        } catch (fsErr) {
          console.error('Local filesystem upload failed:', fsErr)
        }
      }
    }

    if (uploadedPaths.length === 0) {
      if (oversizedCount > 0) {
        return NextResponse.json({ error: 'حجم الصورة كبير جداً (الحد الأقصى هو 10 ميغابايت)' }, { status: 400 })
      }
      if (invalidTypeCount > 0) {
        return NextResponse.json({ error: 'صيغة الملف غير مدعومة. يرجى اختيار صور (JPG, PNG, WebP)' }, { status: 400 })
      }
      return NextResponse.json({ error: 'تعذر رفع الصور، يرجى المحاولة مرة أخرى' }, { status: 500 })
    }

    return NextResponse.json({ paths: uploadedPaths, count: uploadedPaths.length })
  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err?.message || 'خطأ غير متوقع في رفع الصور' }, { status: 500 })
  }
}
