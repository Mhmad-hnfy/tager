import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MerchantPageClient } from './MerchantPageClient'
import { auth } from '@/lib/auth'

export default async function MerchantPage({ params }: { params: { id: string } }) {
  const [merchant, session] = await Promise.all([
    prisma.wholesaleProfile.findUnique({
      where: { id: params.id },
      include: {
        wilaya: true,
        commune: true,
        user: { select: { status: true } },
        categories: {
          where: { isGlobal: false },
          include: { parent: true, children: true },
        },
        deliverySchedules: {
          where: { isActive: true },
          include: { wilaya: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        products: {
          where: { isHidden: false },
          include: {
            category: {
              include: { parent: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    auth(),
  ])

  if (!merchant || merchant.user.status !== 'ACTIVE') notFound()

  let userRetailProfile = null
  if (session?.user?.id) {
    userRetailProfile = await prisma.retailProfile.findUnique({
      where: { userId: session.user.id },
      include: { wilaya: true, commune: true },
    })
  }

  const globalCategories = await prisma.category.findMany({
    where: { isGlobal: true },
    include: { children: true },
  })

  return (
    <MerchantPageClient
      merchant={JSON.parse(JSON.stringify(merchant))}
      globalCategories={JSON.parse(JSON.stringify(globalCategories))}
      userRetailProfile={userRetailProfile ? JSON.parse(JSON.stringify(userRetailProfile)) : null}
    />
  )
}

