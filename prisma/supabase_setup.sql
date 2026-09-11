-- ========================================================
-- تجارنا (Tujaruna) - Supabase PostgreSQL Schema Setup
-- قم بنسخ هذا الكود بالكامل ولصقه في Supabase -> SQL Editor ثم اضغط Run
-- ========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RETAIL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 2. Wholesale Profiles
CREATE TABLE IF NOT EXISTS "wholesale_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wilayaId" TEXT,
    "communeId" TEXT,
    "address" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_profiles_pkey" PRIMARY KEY ("id")
);

-- 3. Retail Profiles
CREATE TABLE IF NOT EXISTS "retail_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wilayaId" TEXT,
    "communeId" TEXT,
    "address" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retail_profiles_pkey" PRIMARY KEY ("id")
);

-- 4. Wilayas
CREATE TABLE IF NOT EXISTS "wilayas" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wilayas_pkey" PRIMARY KEY ("id")
);

-- 5. Communes
CREATE TABLE IF NOT EXISTS "communes" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "wilayaId" TEXT NOT NULL,

    CONSTRAINT "communes_pkey" PRIMARY KEY ("id")
);

-- 6. Categories
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameFr" TEXT,
    "icon" TEXT,
    "wholesaleId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- 7. Products
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- 8. Orders
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "retailId" TEXT NOT NULL,
    "wholesaleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- 9. Order Items
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleFr" TEXT,
    "messageAr" TEXT NOT NULL,
    "messageFr" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 11. Site Settings
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "wholesale_profiles_userId_key" ON "wholesale_profiles"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "retail_profiles_userId_key" ON "retail_profiles"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "wilayas_code_key" ON "wilayas"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_key_key" ON "site_settings"("key");

-- Foreign Keys
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wholesale_profiles_userId_fkey') THEN
        ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wholesale_profiles_wilayaId_fkey') THEN
        ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wholesale_profiles_communeId_fkey') THEN
        ALTER TABLE "wholesale_profiles" ADD CONSTRAINT "wholesale_profiles_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'retail_profiles_userId_fkey') THEN
        ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'retail_profiles_wilayaId_fkey') THEN
        ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'retail_profiles_communeId_fkey') THEN
        ALTER TABLE "retail_profiles" ADD CONSTRAINT "retail_profiles_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'communes_wilayaId_fkey') THEN
        ALTER TABLE "communes" ADD CONSTRAINT "communes_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_wholesaleId_fkey') THEN
        ALTER TABLE "categories" ADD CONSTRAINT "categories_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_categoryId_fkey') THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_wholesaleId_fkey') THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_retailId_fkey') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_retailId_fkey" FOREIGN KEY ("retailId") REFERENCES "retail_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_wholesaleId_fkey') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_wholesaleId_fkey" FOREIGN KEY ("wholesaleId") REFERENCES "wholesale_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_orderId_fkey') THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_productId_fkey') THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_userId_fkey') THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
