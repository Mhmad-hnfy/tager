'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Search, Package, ShoppingCart, Plus, Minus, Check, ArrowRight, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatPrice, parseImages } from '@/lib/utils'
import { useCart } from '@/store/cartStore'

interface Props {
  merchant: any
  globalCategories: any[]
}

export function MerchantPageClient({ merchant, globalCategories }: Props) {
  const { addItem, items } = useCart()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const allCategories = [
    ...merchant.categories,
    ...globalCategories.filter((g: any) => merchant.products.some((p: any) => p.categoryId === g.id))
  ]

  const filteredProducts = merchant.products.filter((p: any) => {
    const matchSearch = !search || p.nameAr.includes(search) || (p.nameFr || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.categoryId === catFilter
    return matchSearch && matchCat && p.isAvailable
  })

  const handleAddToCart = (product: any) => {
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
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="card group"
                >
                  <div className="aspect-square bg-slate-100 rounded-t-2xl overflow-hidden relative">
                    {images[0] ? (
                      <Image src={images[0]} alt={product.nameAr} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="badge bg-slate-700 text-white text-xs">غير متوفر</span>
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
                      <span className="text-xs text-slate-400">
                        {product.quantity > 0 ? `${product.quantity} متوفر` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable}
                      className={cn(
                        'w-full mt-2 btn btn-sm transition-all duration-300',
                        isAdded
                          ? 'bg-green-500 text-white hover:bg-green-500'
                          : 'btn-primary'
                      )}
                    >
                      {isAdded ? (
                        <><Check className="w-3 h-3" /> تمت الإضافة</>
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
