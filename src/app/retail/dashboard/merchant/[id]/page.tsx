import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MerchantPageClient } from './MerchantPageClient'

export default async function MerchantPage({ params }: { params: { id: string } }) {
  const merchant = await prisma.wholesaleProfile.findUnique({
    where: { id: params.id },
    include: {
      wilaya: true,
      commune: true,
      user: { select: { status: true } },
      categories: { where: { isGlobal: false } },
      products: {
        where: { isHidden: false },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!merchant || merchant.user.status !== 'ACTIVE') notFound()

  const globalCategories = await prisma.category.findMany({ where: { isGlobal: true } })

  return (
    <MerchantPageClient
      merchant={JSON.parse(JSON.stringify(merchant))}
      globalCategories={JSON.parse(JSON.stringify(globalCategories))}
    />
  )
}
