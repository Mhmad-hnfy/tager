'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Search, Package, ShoppingCart, Plus, Check,
  ArrowRight, Store, Truck, Calendar, CheckCircle2, AlertCircle, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, parseImages } from '@/lib/utils'
import { useCart } from '@/store/cartStore'

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
]

interface Props {
  merchant: any
  globalCategories: any[]
  userRetailProfile?: any
}

export function MerchantPageClient({ merchant, globalCategories, userRetailProfile }: Props) {
  const { addItem, items } = useCart()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  // Zone matching state
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [autoMatched, setAutoMatched] = useState(false)
  const [showZonePicker, setShowZonePicker] = useState(false)
  const [zoneQuery, setZoneQuery] = useState('')

  const schedules = merchant.deliverySchedules || []

  // Find active (enabled) schedules only
  const activeSchedules = schedules.filter((s: any) => s.isActive)

  // Auto-match retailer zone on mount if available
  useEffect(() => {
    if (!selectedZone && userRetailProfile && activeSchedules.length > 0) {
      const zName = (userRetailProfile.zoneName || '').trim().toLowerCase()
      const cName = (userRetailProfile.commune?.nameAr || '').trim().toLowerCase()
      const wName = (userRetailProfile.wilaya?.nameAr || '').trim().toLowerCase()

      const match = activeSchedules.find((s: any) => {
        const sZone = (s.zoneName || '').toLowerCase()
        const sCommunes = (s.communeNames || '').toLowerCase()
        if (zName && (sZone.includes(zName) || zName.includes(sZone) || sCommunes.includes(zName))) return true
        if (cName && (sCommunes.includes(cName) || sZone.includes(cName))) return true
        if (userRetailProfile.wilayaId && s.wilayaId === userRetailProfile.wilayaId) return true
        return false
      })

      if (match) {
        setSelectedZone(match.id)
        setAutoMatched(true)
      }
    }
  }, [userRetailProfile, activeSchedules, selectedZone])

  // Matched delivery day for selected zone
  const matchedSchedule = useMemo(() => {
    if (!selectedZone) return null
    return activeSchedules.find((s: any) => s.id === selectedZone) || null
  }, [selectedZone, activeSchedules])

  // Today's day of week
  const todayDow = new Date().getDay()
  const nextDeliveryDay = useMemo(() => {
    if (!matchedSchedule) return null
    const targetDow = matchedSchedule.dayOfWeek
    let daysUntil = targetDow - todayDow
    if (daysUntil <= 0) daysUntil += 7
    if (daysUntil === 0) return 'اليوم! 🎉'
    if (daysUntil === 1) return 'غداً ⏰'
    return `بعد ${daysUntil} أيام (${matchedSchedule.dayNameAr})`
  }, [matchedSchedule, todayDow])

  const allCategories = [
    ...merchant.categories,
    ...globalCategories.filter((g: any) => merchant.products.some((p: any) => p.categoryId === g.id))
  ]

  // Build hierarchical categories from products
  const productCategories = useMemo(() => {
    const cats: any[] = []
    const seen = new Set()
    merchant.products.forEach((p: any) => {
      if (p.category && !seen.has(p.category.id)) {
        cats.push(p.category)
        seen.add(p.category.id)
      }
    })
    return cats
  }, [merchant.products])

  const filteredProducts = merchant.products.filter((p: any) => {
    const matchSearch = !search || p.nameAr.includes(search) || (p.nameFr || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.categoryId === catFilter
    return matchSearch && matchCat && !p.isHidden
  })

  const handleAddToCart = (product: any) => {
    if (product.quantity === 0) {
      toast.error('نفذت الكمية من هذا المنتج')
      return
    }
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity: 1,
      maxQty: product.quantity || 999,
      image: parseImages(product.images)[0],
      wholesaleId: merchant.id,
      wholesaleName: merchant.companyName,
    })
    setAddedIds(prev => new Set(prev).add(product.id))
    toast.success(`تمت الإضافة: ${product.nameAr}`)
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  const cartItemCount = items.filter(i => i.wholesaleId === merchant.id).length

  return (
    <div className="space-y-5">
      {/* Merchant Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {merchant.logo ? (
              <Image src={merchant.logo} alt={merchant.companyName} width={64} height={64} className="object-cover" />
            ) : (
              <Store className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">{merchant.companyName}</h1>
            <p className="text-slate-500 text-sm">{merchant.ownerName}</p>
            {(merchant.wilaya || merchant.commune) && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{merchant.wilaya?.nameAr}{merchant.commune ? ` · ${merchant.commune.nameAr}` : ''}</span>
              </div>
            )}
            {merchant.phone && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Phone className="w-3 h-3" />
                <span dir="ltr">{merchant.phone}</span>
              </div>
            )}
          </div>
          {cartItemCount > 0 && (
            <Link href="/retail/dashboard/cart" className="btn btn-primary btn-sm">
              <ShoppingCart className="w-4 h-4" />
              السلة ({cartItemCount})
            </Link>
          )}
        </div>
        {merchant.description && (
          <p className="text-slate-600 text-sm mt-3 border-t border-slate-50 pt-3">{merchant.description}</p>
        )}
      </motion.div>

      {/* Smart Delivery Schedule with Zone Selection */}
      {activeSchedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/60"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">جدول مواعيد التوزيع</h2>
              <p className="text-xs text-emerald-700">اختر منطقتك لمعرفة موعد وصول البضاعة</p>
            </div>
          </div>

          {/* Zone Picker */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-emerald-800 mb-1.5 block">📍 اختر منطقتك:</label>
            <button
              onClick={() => setShowZonePicker(!showZonePicker)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                selectedZone
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'border-dashed border-emerald-300 bg-white text-emerald-600 hover:border-emerald-400'
              )}
            >
              <span>
                {selectedZone
                  ? `📍 ${activeSchedules.find((s: any) => s.id === selectedZone)?.zoneName}`
                  : 'اضغط هنا لاختيار منطقتك'}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showZonePicker && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {showZonePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 bg-white rounded-xl border border-emerald-100 shadow-md overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-300"
                          placeholder="ابحث عن منطقتك..."
                          value={zoneQuery}
                          onChange={e => setZoneQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {activeSchedules
                        .filter((s: any) => !zoneQuery || s.zoneName.includes(zoneQuery) || (s.communeNames || '').includes(zoneQuery))
                        .map((s: any) => (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedZone(s.id); setShowZonePicker(false); setZoneQuery('') }}
                            className={cn(
                              'w-full text-right px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-center gap-3',
                              selectedZone === s.id && 'bg-emerald-50 text-emerald-800 font-semibold'
                            )}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                <span className="font-medium">{s.zoneName}</span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  {s.dayNameAr}
                                </span>
                              </div>
                              {s.communeNames && (
                                <p className="text-xs text-slate-400 mt-0.5 pr-5">{s.communeNames}</p>
                              )}
                            </div>
                            {selectedZone === s.id && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          </button>
                        ))}
                      {activeSchedules.filter((s: any) => !zoneQuery || s.zoneName.includes(zoneQuery) || (s.communeNames || '').includes(zoneQuery)).length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          لا توجد مناطق تطابق البحث
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Delivery Day Result */}
          <AnimatePresence>
            {matchedSchedule && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border-2 border-emerald-300 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-700 font-medium mb-1">موعد التوصيل لمنطقتك:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        يوم {matchedSchedule.dayNameAr}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{nextDeliveryDay}</span>
                    </div>
                    {matchedSchedule.notes && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mt-2 border border-amber-100">
                        ⏰ {matchedSchedule.notes}
                      </p>
                    )}
                    {matchedSchedule.communeNames && (
                      <p className="text-xs text-slate-500 mt-1">
                        المناطق: {matchedSchedule.communeNames}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All zones summary */}
          {!selectedZone && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
              {activeSchedules.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedZone(s.id)}
                  className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs text-right hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      {s.dayNameAr}
                    </span>
                    {s.wilaya && (
                      <span className="text-[11px] text-slate-500">{s.wilaya.nameAr}</span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-danger-500 flex-shrink-0" />
                    {s.zoneName}
                  </div>
                  {s.communeNames && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{s.communeNames}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      {allCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCatFilter('')}
            className={cn('badge cursor-pointer whitespace-nowrap transition-all px-4 py-2',
              !catFilter ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            الكل
          </button>
          {allCategories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setCatFilter(cat.id === catFilter ? '' : cat.id)}
              className={cn('badge cursor-pointer whitespace-nowrap transition-all px-4 py-2',
                catFilter === cat.id ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.icon && <span className="ml-1">{cat.icon}</span>}
              {cat.nameAr}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card empty-state py-16">
          <Package className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="product-grid">
          <AnimatePresence>
            {filteredProducts.map((product: any, i: number) => {
              const images = parseImages(product.images)
              const isAdded = addedIds.has(product.id)
              const isOutOfStock = product.quantity === 0

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn('card group', isOutOfStock && 'opacity-80')}
                >
                  <div className="aspect-square bg-slate-100 rounded-t-2xl overflow-hidden relative">
                    {images[0] ? (
                      <Image src={images[0]} alt={product.nameAr} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="badge bg-orange-600 text-white text-xs font-bold">🔴 نفذت الكمية</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-slate-800 text-sm truncate mb-0.5">{product.nameAr}</h3>
                    {product.category && (
                      <span className="badge bg-slate-100 text-slate-500 text-xs mb-2">{product.category.nameAr}</span>
                    )}
                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-primary-700 text-sm">{formatPrice(product.price)}</span>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-lg',
                        isOutOfStock ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                      )}>
                        {isOutOfStock ? '🔴 نفذ' : `${product.quantity} متوفر`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={cn(
                        'w-full mt-2 btn btn-sm transition-all duration-300',
                        isAdded
                          ? 'bg-green-500 text-white hover:bg-green-500'
                          : isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'btn-primary'
                      )}
                    >
                      {isAdded ? (
                        <><Check className="w-3 h-3" /> تمت الإضافة</>
                      ) : isOutOfStock ? (
                        'نفذت الكمية'
                      ) : (
                        <><Plus className="w-3 h-3" /> أضف للطلب</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating cart button */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <Link
              href="/retail/dashboard/cart"
              className="flex items-center gap-3 bg-primary-700 text-white px-6 py-3 rounded-full shadow-2xl shadow-primary-700/30 hover:bg-primary-800 transition-all hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">عرض السلة ({cartItemCount} منتج)</span>
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
