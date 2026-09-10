import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { phone: process.env.ADMIN_PHONE || '0555000000' },
    update: {},
    create: {
      phone: process.env.ADMIN_PHONE || '0555000000',
      email: process.env.ADMIN_EMAIL || 'admin@tujaruna.dz',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Admin created:', admin.phone)

  // Create some sample wilayas
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

    // Add sample communes for Algiers
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
        await prisma.commune.create({ data: { ...c, wilayaId: wilaya.id } }).catch(() => {})
      }
    }
  }
  console.log('✅ Wilayas seeded')

  // Create global categories
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
    await prisma.category.create({ data: cat }).catch(() => {})
  }
  console.log('✅ Global categories seeded')

  // Site settings
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
  }
  console.log('✅ Site settings seeded')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
