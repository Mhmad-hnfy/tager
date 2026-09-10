'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface CartItem {
  productId: string
  nameAr: string
  price: number
  quantity: number
  maxQty: number
  image?: string
  wholesaleId: string
  wholesaleName: string
}

interface CartContextType {
  items: CartItem[]
  wholesaleId: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [wholesaleId, setWholesaleId] = useState<string | null>(null)

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      // If adding from different wholesale, clear cart
      if (wholesaleId && item.wholesaleId !== wholesaleId) {
        setWholesaleId(item.wholesaleId)
        return [{ ...item, quantity: 1 }]
      }
      if (!wholesaleId) setWholesaleId(item.wholesaleId)

      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQty) }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [wholesaleId])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.productId !== productId)
      if (newItems.length === 0) setWholesaleId(null)
      return newItems
    })
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, quantity: Math.min(qty, i.maxQty) }
          : i
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    setWholesaleId(null)
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, wholesaleId, addItem, removeItem, updateQty, clearCart, total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
