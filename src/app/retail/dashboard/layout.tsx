'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Store, ClipboardList, ShoppingCart, User, LogOut,
  Bell, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/store/cartStore'

const navItems = [
  { href: '/retail/dashboard', icon: Store, label: 'تصفح التجار' },
  { href: '/retail/dashboard/orders', icon: ClipboardList, label: 'طلباتي' },
  { href: '/retail/dashboard/profile', icon: User, label: 'ملفي الشخصي' },
]

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const fetchNotifs = () => {
      fetch('/api/notifications?unread=true')
        .then(r => r.json())
        .then(d => setNotifCount(d.unreadCount || 0))
        .catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 fixed top-0 right-0 bottom-0 z-40 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="تجارنا" width={36} height={36} className="rounded-lg" onError={(e: any) => { e.target.style.display = 'none' }} />
            <div>
              <div className="font-black text-primary-700 leading-tight">تجارنا</div>
              <div className="text-xs text-slate-400">تاجر تجزئة</div>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-slate-50 bg-red-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-danger-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{session?.user?.name}</div>
              <div className="text-xs text-slate-400">{session?.user?.phone}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={cn('nav-link', pathname === item.href && 'active')}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
          <Link href="/retail/dashboard/cart" className={cn('nav-link relative', pathname === '/retail/dashboard/cart' && 'active')}>
            <ShoppingCart className="w-5 h-5" />
            سلة الطلبات
            {itemCount > 0 && (
              <span className="mr-auto bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-link w-full text-danger-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40 md:hidden" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-black text-primary-700">تجارنا</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={cn('nav-link', pathname === item.href && 'active')}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                <Link href="/retail/dashboard/cart" onClick={() => setSidebarOpen(false)}
                  className={cn('nav-link', pathname === '/retail/dashboard/cart' && 'active')}>
                  <ShoppingCart className="w-5 h-5" />
                  سلة الطلبات
                  {itemCount > 0 && <span className="mr-auto bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>}
                </Link>
              </nav>
              <div className="p-3 border-t">
                <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-link w-full text-danger-600 hover:bg-red-50">
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Link href="/retail/dashboard/cart" className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600" />
              {itemCount > 0 && <span className="notif-dot">{itemCount}</span>}
            </Link>
            <Link href="/retail/dashboard/notifications" className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifCount > 0 && <span className="notif-dot">{notifCount > 9 ? '9+' : notifCount}</span>}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
