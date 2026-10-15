'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Package, Loader2, Store } from 'lucide-react'

interface Merchant {
  id: string
  companyName: string
  logo?: string
  description?: string
  wilaya?: { nameAr: string }
  commune?: { nameAr: string }
  _count: { products: number }
}

interface RetailProfile {
  wilayaId?: string
  wilaya?: { id: string; nameAr: string }
}

export default function RetailDashboardPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [retailProfile, setRetailProfile] = useState<RetailProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [search, setSearch] = useState('')

  // جلب بروفايل تاجر التجزئة لمعرفة ولايته
  useEffect(() => {
    setLoadingProfile(true)
    fetch('/api/profile/retail')
      .then(r => r.json())
      .then(d => setRetailProfile(d.profile || null))
      .catch(console.error)
      .finally(() => setLoadingProfile(false))
  }, [])

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      // فلترة تلقائية بولاية التاجر
      if (retailProfile?.wilayaId) params.set('wilayaId', retailProfile.wilayaId)
      const res = await fetch(`/api/merchants?${params}`)
      const data = await res.json()
      setMerchants(data.merchants || [])
    } finally {
      setLoading(false)
    }
  }

  // جلب التجار بعد ما يجهز البروفايل أو يتغير البحث
  useEffect(() => {
    if (loadingProfile) return
    const timer = setTimeout(fetchMerchants, 300)
    return () => clearTimeout(timer)
  }, [search, retailProfile, loadingProfile])

  const wilayaName = retailProfile?.wilaya?.nameAr

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">تصفح تجار الجملة</h1>
        <p className="section-subtitle">
          {wilayaName
            ? <>تجار الجملة في ولاية <span className="font-bold text-primary-700">{wilayaName}</span></>
            : 'اكتشف التجار في منطقتك وتصفح منتجاتهم'
          }
        </p>
      </div>

      {/* ولاية التاجر badge */}
      {wilayaName && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold border border-primary-100"
        >
          <MapPin className="w-4 h-4" />
          ولايتك: {wilayaName}
        </motion.div>
      )}

      {!wilayaName && !loadingProfile && (
        <div className="card p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          لم يتم تحديد ولايتك بعد. يمكنك تحديثها من صفحة الملف الشخصي لتظهر تجار ولايتك فقط.
        </div>
      )}

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="ابحث عن تاجر جملة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading || loadingProfile ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : merchants.length === 0 ? (
        <div className="card empty-state py-20">
          <Store className="w-16 h-16 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لم يتم العثور على تجار</p>
          <p className="text-slate-400 text-sm">
            {wilayaName
              ? `لا يوجد تجار جملة في ولاية ${wilayaName} حالياً`
              : 'جرب تغيير معايير البحث'
            }
          </p>
        </div>
      ) : (
        <div className="merchant-grid">
          {merchants.map((merchant, i) => (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/retail/dashboard/merchant/${merchant.id}`} className="card-hover block p-5 group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {merchant.logo ? (
                      <Image src={merchant.logo} alt={merchant.companyName} width={56} height={56} className="object-cover" />
                    ) : (
                      <Store className="w-7 h-7 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors truncate">
                      {merchant.companyName}
                    </h3>
                    {(merchant.wilaya || merchant.commune) && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{merchant.wilaya?.nameAr}{merchant.commune ? ` · ${merchant.commune.nameAr}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                {merchant.description && (
                  <p className="text-slate-500 text-xs line-clamp-2 mb-3">{merchant.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-3">
                  <Package className="w-3.5 h-3.5 text-primary-600" />
                  <span>{merchant._count.products} منتج متوفر</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
