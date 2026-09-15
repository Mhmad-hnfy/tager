'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Search, Package, ShoppingCart, Plus, Check,
  ArrowRight, Store, Truck, Calendar, CheckCircle2, AlertCircle, ChevronDown,
  Layers, FolderTree, Tag, Sparkles
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
  const [selectedMainCat, setSelectedMainCat] = useState<string | null>(null)
  const [selectedSubBranch, setSelectedSubBranch] = useState<string | null>(null)
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

  // All categories available in this merchant
  const allCategories = useMemo(() => {
    const map = new Map<string, any>()
    ;(merchant.categories || []).forEach((c: any) => map.set(c.id, c))
    globalCategories.forEach((g: any) => {
      if (!map.has(g.id)) map.set(g.id, g)
    })
    // Also include any category from products
    ;(merchant.products || []).forEach((p: any) => {
      if (p.category && !map.has(p.category.id)) {
        map.set(p.category.id, p.category)
      }
      if (p.category?.parent && !map.has(p.category.parent.id)) {
        map.set(p.category.parent.id, p.category.parent)
      }
    })
    return Array.from(map.values())
  }, [merchant.categories, globalCategories, merchant.products])

  // Root (Main) Categories: where parentId is null
  const rootCategories = useMemo(() => {
    const roots = allCategories.filter((c: any) => !c.parentId)
    return roots.map((rc: any) => {
      // Find all child branches
      const childBranchIds = new Set(allCategories.filter((c: any) => c.parentId === rc.id).map((c: any) => c.id))
      childBranchIds.add(rc.id)
      const count = merchant.products.filter((p: any) => !p.isHidden && p.categoryId && childBranchIds.has(p.categoryId)).length
      return { ...rc, productCount: count }
    })
  }, [allCategories, merchant.products])

  // Sub-branches for the selected main category
  const currentBranches = useMemo(() => {
    if (!selectedMainCat) return []
    return allCategories
      .filter((c: any) => c.parentId === selectedMainCat)
      .map((b: any) => {
        const count = merchant.products.filter((p: any) => !p.isHidden && p.categoryId === b.id).length
        return { ...b, productCount: count }
      })
  }, [allCategories, selectedMainCat, merchant.products])

  // Selected main category details
  const activeMainCatObj = useMemo(() => {
    if (!selectedMainCat) return null
    return rootCategories.find((c: any) => c.id === selectedMainCat) || null
  }, [selectedMainCat, rootCategories])

  // Filtered products based on search, main category, and sub-branch
  const filteredProducts = useMemo(() => {
    return merchant.products.filter((p: any) => {
      if (p.isHidden) return false

      if (search) {
        const q = search.toLowerCase()
        const matchName = p.nameAr.toLowerCase().includes(q) || (p.nameFr && p.nameFr.toLowerCase().includes(q))
        if (!matchName) return false
      }

      // If a specific sub-branch is selected
      if (selectedSubBranch) {
        return p.categoryId === selectedSubBranch
      }

      // If a main category is selected
      if (selectedMainCat) {
        if (p.categoryId === selectedMainCat) return true
        if (p.category?.parentId === selectedMainCat) return true
        const branchIds = allCategories.filter((c: any) => c.parentId === selectedMainCat).map((c: any) => c.id)
        if (p.categoryId && branchIds.includes(p.categoryId)) return true
        return false
      }

      return true
    })
  }, [merchant.products, search, selectedMainCat, selectedSubBranch, allCategories])

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

      {/* Smart Delivery Schedule with Zone Selection - Centered on Mobile */}
      {activeSchedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 sm:p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/60"
        >
          {/* Header centered on mobile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-emerald-950">جدول مواعيد التوزيع</h2>
              <p className="text-xs text-emerald-700">اختر منطقتك لمعرفة موعد وصول البضاعة</p>
            </div>
          </div>

          {/* Zone Picker */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-emerald-800 mb-1.5 block text-center sm:text-right">
              📍 اختر منطقتك:
            </label>
            <button
              onClick={() => setShowZonePicker(!showZonePicker)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-center sm:text-right',
                selectedZone
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'border-dashed border-emerald-300 bg-white text-emerald-600 hover:border-emerald-400'
              )}
            >
              <span className="flex-1 text-center sm:text-right">
                {selectedZone
                  ? `📍 ${activeSchedules.find((s: any) => s.id === selectedZone)?.zoneName}`
                  : 'اضغط هنا لاختيار منطقتك'}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform flex-shrink-0', showZonePicker && 'rotate-180')} />
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
                          className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-300 text-center sm:text-right"
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

          {/* Delivery Day Result - Centered on Mobile */}
          <AnimatePresence>
            {matchedSchedule && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border-2 border-emerald-300 p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs text-emerald-700 font-medium mb-1">موعد التوصيل لمنطقتك:</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 shadow-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        يوم {matchedSchedule.dayNameAr}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{nextDeliveryDay}</span>
                    </div>
                    {matchedSchedule.notes && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mt-2 border border-amber-100 text-center sm:text-right">
                        ⏰ {matchedSchedule.notes}
                      </p>
                    )}
                    {matchedSchedule.communeNames && (
                      <p className="text-xs text-slate-500 mt-1 text-center sm:text-right">
                        المناطق: {matchedSchedule.communeNames}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All zones summary - Centered cards on mobile */}
          {!selectedZone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
              {activeSchedules.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedZone(s.id)}
                  className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs text-center sm:text-right hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="flex items-center justify-center sm:justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      {s.dayNameAr}
                    </span>
                    {s.wilaya && (
                      <span className="text-[11px] text-slate-500 hidden sm:inline">{s.wilaya.nameAr}</span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-800 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-danger-500 flex-shrink-0" />
                    {s.zoneName}
                  </div>
                  {s.communeNames && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate text-center sm:text-right">{s.communeNames}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="form-input pr-10"
          placeholder="ابحث عن أي منتج أو سلعة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Hierarchical Categories & Sub-branches Selector */}
      <div className="space-y-3">
        {/* LEVEL 1: Main Categories (الأقسام / المنتجات الرئيسية) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary-600" />
              المنتجات والأقسام الرئيسية:
            </span>
            <span className="text-[11px] text-slate-400">
              {filteredProducts.length} منتج متاح
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {/* All Products Tab */}
            <button
              onClick={() => {
                setSelectedMainCat(null)
                setSelectedSubBranch(null)
              }}
              className={cn(
                'cursor-pointer whitespace-nowrap transition-all px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-shrink-0 shadow-2xs',
                !selectedMainCat
                  ? 'bg-primary-700 text-white shadow-sm ring-2 ring-primary-700/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-slate-50'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>جميع المنتجات</span>
              <span className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                !selectedMainCat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              )}>
                {merchant.products.filter((p: any) => !p.isHidden).length}
              </span>
            </button>

            {/* Main Categories Pills */}
            {rootCategories.map((cat: any) => {
              const isSelected = selectedMainCat === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMainCat(null)
                      setSelectedSubBranch(null)
                    } else {
                      setSelectedMainCat(cat.id)
                      setSelectedSubBranch(null)
                    }
                  }}
                  className={cn(
                    'cursor-pointer whitespace-nowrap transition-all px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 flex-shrink-0 shadow-2xs',
                    isSelected
                      ? 'bg-primary-700 text-white shadow-sm ring-2 ring-primary-700/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-slate-50'
                  )}
                >
                  {cat.icon ? <span>{cat.icon}</span> : <Package className="w-3.5 h-3.5 text-primary-500" />}
                  <span>{cat.nameAr}</span>
                  {cat.productCount > 0 && (
                    <span className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      {cat.productCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* LEVEL 2: Sub-branches under selected Main Category (فروع القسم الرئيسي) */}
        <AnimatePresence>
          {selectedMainCat && currentBranches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="bg-gradient-to-r from-primary-50/80 to-blue-50/60 border border-primary-100/90 rounded-2xl p-3.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <FolderTree className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-black text-primary-900">
                  فروع ومنتجات قسم ({activeMainCatObj?.nameAr}):
                </span>
                <span className="text-[11px] text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-full font-bold">
                  {currentBranches.length} فرع
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {/* All branches of this main category */}
                <button
                  onClick={() => setSelectedSubBranch(null)}
                  className={cn(
                    'cursor-pointer whitespace-nowrap transition-all px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0',
                    !selectedSubBranch
                      ? 'bg-primary-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-primary-200/80 hover:bg-primary-100/50'
                  )}
                >
                  <span>الكل في هذا القسم</span>
                  <span className="text-[10px] opacity-80">({activeMainCatObj?.productCount || 0})</span>
                </button>

                {/* Sub-branches list */}
                {currentBranches.map((branch: any) => {
                  const isBranchActive = selectedSubBranch === branch.id
                  return (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedSubBranch(isBranchActive ? null : branch.id)}
                      className={cn(
                        'cursor-pointer whitespace-nowrap transition-all px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0',
                        isBranchActive
                          ? 'bg-primary-800 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-primary-200/80 hover:bg-primary-100/50'
                      )}
                    >
                      <Tag className="w-3 h-3 text-primary-600" />
                      <span>{branch.nameAr}</span>
                      {branch.productCount > 0 && (
                        <span className={cn(
                          'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                          isBranchActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        )}>
                          {branch.productCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                      <span className="badge bg-slate-100 text-slate-600 text-xs mb-2 flex items-center gap-1 w-fit">
                        <Tag className="w-2.5 h-2.5 text-primary-600" />
                        {product.category.parent && (
                          <span className="text-slate-400 font-medium">{product.category.parent.nameAr} ›</span>
                        )}
                        <span className="font-semibold">{product.category.nameAr}</span>
                      </span>
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
