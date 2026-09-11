import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  return handleSeed()
}

export async function POST() {
  return handleSeed()
}

async function handleSeed() {
  try {
    const results = {
      admin: false,
      wilayas: 0,
      categories: 0,
      settings: 0,
    }

    // 1. Create or Update Admin
    const adminPhone = process.env.ADMIN_PHONE || '0555000000'
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tujaruna.dz').toLowerCase().trim()
    const rawPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123'
    const hashedPassword = await bcrypt.hash(rawPassword, 12)

    await prisma.user.upsert({
      where: { phone: adminPhone },
      update: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })
    results.admin = true

    // 2. Sample wilayas
    const wilayasData = [
      { nameAr: 'الجزائر العاصمة', nameFr: 'Alger', code: '16' },
      { nameAr: 'وهران', nameFr: 'Oran', code: '31' },
      { nameAr: 'قسنطينة', nameFr: 'Constantine', code: '25' },
      { nameAr: 'عنابة', nameFr: 'Annaba', code: '23' },
      { nameAr: 'بجاية', nameFr: 'Béjaïa', code: '06' },
      { nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', code: '15' },
      { nameAr: 'سطيف', nameFr: 'Sétif', code: '19' },
      { nameAr: 'بلعباس', nameFr: 'Sidi Bel Abbès', code: '22' },
      { nameAr: 'المسيلة', nameFr: 'M\'Sila', code: '28' },
      { nameAr: 'البويرة', nameFr: 'Bouira', code: '10' },
    ]

    for (const w of wilayasData) {
      const wilaya = await prisma.wilaya.upsert({
        where: { code: w.code },
        update: {},
        create: w,
      })
      results.wilayas++

      // Sample communes for Algiers
      if (w.code === '16') {
        const communes = [
          { nameAr: 'باب الوادي', nameFr: 'Bab El Oued' },
          { nameAr: 'بولوغين', nameFr: 'Bologhine' },
          { nameAr: 'الحراش', nameFr: 'El Harrach' },
          { nameAr: 'براقي', nameFr: 'Baraki' },
          { nameAr: 'المحمدية', nameFr: 'Mohammadia' },
          { nameAr: 'وادي السمار', nameFr: 'Oued Smar' },
          { nameAr: 'الدار البيضاء', nameFr: 'Dar El Beïda' },
          { nameAr: 'بوزريعة', nameFr: 'Bouzareah' },
        ]
        for (const c of communes) {
          const exists = await prisma.commune.findFirst({
            where: { wilayaId: wilaya.id, nameAr: c.nameAr },
          })
          if (!exists) {
            await prisma.commune.create({ data: { ...c, wilayaId: wilaya.id } }).catch(() => {})
          }
        }
      }
    }

    // 3. Global categories
    const categoriesData = [
      { nameAr: 'مشروبات', nameFr: 'Boissons', icon: '🧃', isGlobal: true },
      { nameAr: 'مواد غذائية', nameFr: 'Produits alimentaires', icon: '🛒', isGlobal: true },
      { nameAr: 'منظفات', nameFr: 'Produits d\'entretien', icon: '🧹', isGlobal: true },
      { nameAr: 'معلبات', nameFr: 'Conserves', icon: '🥫', isGlobal: true },
      { nameAr: 'حلويات', nameFr: 'Confiseries', icon: '🍬', isGlobal: true },
      { nameAr: 'منتجات الألبان', nameFr: 'Produits laitiers', icon: '🥛', isGlobal: true },
      { nameAr: 'بقوليات وحبوب', nameFr: 'Légumineuses et céréales', icon: '🌾', isGlobal: true },
      { nameAr: 'منتجات التجميل', nameFr: 'Cosmétiques', icon: '💄', isGlobal: true },
      { nameAr: 'أخرى', nameFr: 'Autres', icon: '📦', isGlobal: true },
    ]

    for (const cat of categoriesData) {
      const exists = await prisma.category.findFirst({
        where: { nameAr: cat.nameAr, isGlobal: true },
      })
      if (!exists) {
        await prisma.category.create({ data: cat }).catch(() => {})
        results.categories++
      }
    }

    // 4. Site settings
    const settings = [
      { key: 'site_name_ar', value: 'تجارنا' },
      { key: 'site_name_fr', value: 'Tujaruna' },
      { key: 'site_tagline_ar', value: 'من الجملة إلى محلك' },
      { key: 'site_tagline_fr', value: 'Du gros à votre boutique' },
      { key: 'site_phone', value: '0555000000' },
      { key: 'site_email', value: 'contact@tujaruna.dz' },
    ]

    for (const s of settings) {
      await prisma.siteSettings.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      })
      results.settings++
    }

    return NextResponse.json({
      success: true,
      message: 'تمت تهيئة قاعدة البيانات بنجاح! 🎉',
      admin: {
        phone: adminPhone,
        email: adminEmail,
        loginHint: `يمكنك تسجيل الدخول بالرقم (${adminPhone}) أو بالإيميل (${adminEmail}) وكلمة المرور (${rawPassword})`,
      },
      stats: results,
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'حدث خطأ أثناء تهيئة قاعدة البيانات',
        hint: 'إذا لم يتم إنشاء الجداول بعد في Supabase، تأكد من تشغيل npx prisma db push أولاً',
      },
      { status: 500 }
    )
  }
}
