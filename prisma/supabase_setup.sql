-- =========================================================================
-- منصة تجارنا (Tujaruna) - إعداد قاعدة بيانات Supabase PostgreSQL من الصفر
-- =========================================================================
-- طريقة الاستخدام:
-- 1. افتح مشروعك في Supabase
-- 2. اذهب إلى SQL Editor
-- 3. انسخ هذا الكود بالكامل، الصقه هناك، واضغط Run (تشغيل)
-- =========================================================================

-- الخطوة 1: مسح أي جداول قديمة بالكامل
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "delivery_schedules" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "communes" CASCADE;
DROP TABLE IF EXISTS "wilayas" CASCADE;
DROP TABLE IF EXISTS "retail_profiles" CASCADE;
DROP TABLE IF EXISTS "wholesale_profiles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "site_settings" CASCADE;

-- الخطوة 2: إنشاء الجداول من الصفر

-- جدول المستخدمين (Users)
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT UNIQUE,
    "phone" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RETAIL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول ملفات تجار الجملة (Wholesale Profiles)
CREATE TABLE "wholesale_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "companyName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wilayaId" TEXT,
    "communeId" TEXT,
    "address" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "mapUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول ملفات تجار التجزئة (Retail Profiles)
CREATE TABLE "retail_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wilayaId" TEXT,
    "communeId" TEXT,
    "address" TEXT,
    "description" TEXT,
    "mapUrl" TEXT,
    "zoneName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول الولايات (Wilayas)
CREATE TABLE "wilayas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE
);

-- جدول البلديات (Communes)
CREATE TABLE "communes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "wilayaId" TEXT NOT NULL
);

-- جدول التصنيفات (Categories)
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT,
    "icon" TEXT,
    "wholesaleId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول مواعيد التوزيع (Delivery Schedules)
CREATE TABLE "delivery_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wholesaleId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "dayNameAr" TEXT NOT NULL,
    "wilayaId" TEXT,
    "zoneName" TEXT NOT NULL,
    "communeNames" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات (Products)
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT NOT NULL DEFAULT '[]',
    "categoryId" TEXT,
    "wholesaleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول الطلبات (Orders)
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "retailId" TEXT NOT NULL,
    "wholesaleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول عناصر الطلب (Order Items)
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL
);

-- جدول الإشعارات (Notifications)
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleFr" TEXT,
    "messageAr" TEXT NOT NULL,
    "messageFr" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول إعدادات الموقع (Site Settings)
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- الخطوة 3: ربط المفاتيح الأجنبية (Foreign Keys)
ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communes" ADD CONSTRAINT "communes_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_retailId_fkey" FOREIGN KEY ("retailId") REFERENCES "retail_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- الخطوة 4: حقن البيانات الأساسية (Seed) مباشرة داخل قاعدة البيانات

-- 1. إضافة حساب الأدمن (كلمة المرور: AdminPassword123)
INSERT INTO "users" ("id", "phone", "email", "password", "role", "status", "createdAt", "updatedAt")
VALUES (
    'admin-root-001',
    '0555000000',
    'admin@tujaruna.dz',
    '$2a$12$HWsd.GPtNy7tvpT085fjHeqSbsbPxBFGRPB0L64V8ma8NlMwWw.om',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. إضافة الولايات الأساسية
INSERT INTO "wilayas" ("id", "code", "nameAr", "nameFr") VALUES
('wilaya-16', '16', 'الجزائر العاصمة', 'Alger'),
('wilaya-31', '31', 'وهران', 'Oran'),
('wilaya-25', '25', 'قسنطينة', 'Constantine'),
('wilaya-23', '23', 'عنابة', 'Annaba'),
('wilaya-06', '06', 'بجاية', 'Béjaïa'),
('wilaya-15', '15', 'تيزي وزو', 'Tizi Ouzou'),
('wilaya-19', '19', 'سطيف', 'Sétif'),
('wilaya-22', '22', 'بلعباس', 'Sidi Bel Abbès'),
('wilaya-28', '28', 'المسيلة', 'M''Sila'),
('wilaya-10', '10', 'البويرة', 'Bouira');

-- 3. إضافة بلديات العاصمة
INSERT INTO "communes" ("id", "nameAr", "nameFr", "wilayaId") VALUES
('commune-16-01', 'باب الوادي', 'Bab El Oued', 'wilaya-16'),
('commune-16-02', 'بولوغين', 'Bologhine', 'wilaya-16'),
('commune-16-03', 'الحراش', 'El Harrach', 'wilaya-16'),
('commune-16-04', 'براقي', 'Baraki', 'wilaya-16'),
('commune-16-05', 'المحمدية', 'Mohammadia', 'wilaya-16'),
('commune-16-06', 'وادي السمار', 'Oued Smar', 'wilaya-16'),
('commune-16-07', 'الدار البيضاء', 'Dar El Beïda', 'wilaya-16'),
('commune-16-08', 'بوزريعة', 'Bouzareah', 'wilaya-16');

-- 4. إضافة التصنيفات العامة الأولية
INSERT INTO "categories" ("id", "nameAr", "nameFr", "icon", "isGlobal", "createdAt") VALUES
('cat-01', 'مشروبات', 'Boissons', '🧃', true, CURRENT_TIMESTAMP),
('cat-02', 'مواد غذائية', 'Produits alimentaires', '🛒', true, CURRENT_TIMESTAMP),
('cat-03', 'منظفات', 'Produits d''entretien', '🧹', true, CURRENT_TIMESTAMP),
('cat-04', 'معلبات', 'Conserves', '🥫', true, CURRENT_TIMESTAMP),
('cat-05', 'حلويات', 'Confiseries', '🍬', true, CURRENT_TIMESTAMP),
('cat-06', 'منتجات الألبان', 'Produits laitiers', '🥛', true, CURRENT_TIMESTAMP),
('cat-07', 'بقوليات وحبوب', 'Légumineuses et céréales', '🌾', true, CURRENT_TIMESTAMP),
('cat-08', 'منتجات التجميل', 'Cosmétiques', '💄', true, CURRENT_TIMESTAMP),
('cat-09', 'أخرى', 'Autres', '📦', true, CURRENT_TIMESTAMP);

-- 5. إضافة إعدادات الموقع
INSERT INTO "site_settings" ("id", "key", "value", "updatedAt") VALUES
('setting-01', 'site_name_ar', 'تجارنا', CURRENT_TIMESTAMP),
('setting-02', 'site_name_fr', 'Tujaruna', CURRENT_TIMESTAMP),
('setting-03', 'site_tagline_ar', 'من الجملة إلى محلك', CURRENT_TIMESTAMP),
('setting-04', 'site_tagline_fr', 'Du gros à votre boutique', CURRENT_TIMESTAMP),
('setting-05', 'site_phone', '0555000000', CURRENT_TIMESTAMP),
('setting-06', 'site_email', 'contact@tujaruna.dz', CURRENT_TIMESTAMP);

-- تم بحمد الله: قاعدة البيانات جاهزة 100% وحساب الأدمن مفعّل وجاهز لتسجيل الدخول!
