'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Store, ClipboardList, ShoppingCart, User, LogOut,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/store/cartStore'

const navItems = [
  { href: '/retail/dashboard', icon: Store, label: 'تصفح التجار' },
  { href: '/retail/dashboard/orders', icon: ClipboardList, label: 'طلباتي' },
  { href: '/retail/dashboard/profile', icon: User, label: 'حسابي' },
]

export default function RetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { itemCount } = useCart()
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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-100 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/retail/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 relative transition-colors',
                  isActive ? 'text-danger-600' : 'text-slate-400'
                )}
              >
                <div className={cn('relative p-1.5 rounded-xl transition-colors', isActive && 'bg-red-50')}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cn('text-[10px] font-medium leading-tight', isActive ? 'text-danger-600' : 'text-slate-400')}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="retail-tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-danger-600 rounded-full"
                  />
                )}
              </Link>
            )
          })}
          {/* Cart */}
          <Link
            href="/retail/dashboard/cart"
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 relative transition-colors',
              pathname === '/retail/dashboard/cart' ? 'text-danger-600' : 'text-slate-400'
            )}
          >
            <div className={cn('relative p-1.5 rounded-xl transition-colors', pathname === '/retail/dashboard/cart' && 'bg-red-50')}>
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-danger-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </div>
            <span className={cn('text-[10px] font-medium leading-tight', pathname === '/retail/dashboard/cart' ? 'text-danger-600' : 'text-slate-400')}>سلة</span>
            {pathname === '/retail/dashboard/cart' && (
              <motion.div
                layoutId="retail-tab-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-danger-600 rounded-full"
              />
            )}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 text-danger-500 transition-colors"
          >
            <div className="p-1.5">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium leading-tight">خروج</span>
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          {/* Logo for mobile */}
          <Link href="/" className="md:hidden flex items-center gap-2">
            <Image src="/logo.png" alt="تجارنا" width={32} height={32} className="rounded-lg" onError={(e: any) => { e.target.style.display = 'none' }} />
            <span className="font-black text-primary-700 text-base">تجارنا</span>
          </Link>
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

        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
