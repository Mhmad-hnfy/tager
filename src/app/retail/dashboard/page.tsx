'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Package, Loader2, Store, Filter } from 'lucide-react'

interface Merchant {
  id: string
  companyName: string
  logo?: string
  description?: string
  wilaya?: { nameAr: string }
  commune?: { nameAr: string }
  _count: { products: number }
}

interface Wilaya { id: string; nameAr: string }

export default function RetailDashboardPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [wilayaFilter, setWilayaFilter] = useState('')

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (wilayaFilter) params.set('wilayaId', wilayaFilter)
      const res = await fetch(`/api/merchants?${params}`)
      const data = await res.json()
      setMerchants(data.merchants || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/wilayas').then(r => r.json()).then(d => setWilayas(d.wilayas || []))
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchMerchants, 300)
    return () => clearTimeout(timer)
  }, [search, wilayaFilter])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">تصفح تجار الجملة</h1>
        <p className="section-subtitle">اكتشف التجار في منطقتك وتصفح منتجاتهم</p>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="ابحث عن تاجر جملة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="form-input pr-9 appearance-none"
            value={wilayaFilter}
            onChange={e => setWilayaFilter(e.target.value)}
          >
            <option value="">جميع الولايات</option>
            {wilayas.map(w => <option key={w.id} value={w.id}>{w.nameAr}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : merchants.length === 0 ? (
        <div className="card empty-state py-20">
          <Store className="w-16 h-16 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لم يتم العثور على تجار</p>
          <p className="text-slate-400 text-sm">جرب تغيير معايير البحث</p>
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
