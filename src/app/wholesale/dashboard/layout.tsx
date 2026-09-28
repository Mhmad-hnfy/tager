'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, FolderOpen, ClipboardList,
  User, LogOut, Bell, Store, Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/wholesale/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
  { href: '/wholesale/dashboard/products', icon: Package, label: 'المنتجات' },
  { href: '/wholesale/dashboard/categories', icon: FolderOpen, label: 'الأقسام' },
  { href: '/wholesale/dashboard/delivery-schedule', icon: Truck, label: 'جدول التوزيع والمناطق' },
  { href: '/wholesale/dashboard/orders', icon: ClipboardList, label: 'الطلبات' },
  { href: '/wholesale/dashboard/profile', icon: User, label: 'ملفي الشخصي' },
]

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()
  const [notifCount, setNotifCount] = useState(0)
  const activeTabRef = useRef<HTMLAnchorElement>(null)

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

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

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 fixed top-0 right-0 bottom-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="تجارنا" width={36} height={36} className="rounded-lg" onError={(e: any) => { e.target.style.display = 'none' }} />
            <div>
              <div className="font-black text-primary-700 leading-tight">تجارنا</div>
              <div className="text-xs text-slate-400">تاجر جملة</div>
            </div>
          </Link>
        </div>

        {/* Profile mini */}
        <div className="px-4 py-3 border-b border-slate-50 bg-primary-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{session?.user?.name}</div>
              <div className="text-xs text-slate-400">{session?.user?.phone}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-link', isActive(item) && 'active')}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.href.includes('orders') && notifCount > 0 && (
                <span className="mr-auto bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {notifCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="nav-link w-full text-danger-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 w-full max-w-full md:mr-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          {/* Logo & Store name for mobile */}
          <div className="flex items-center gap-2">
            <Link href="/" className="md:hidden flex items-center gap-2">
              <Image src="/logo.png" alt="تجارنا" width={32} height={32} className="rounded-lg" onError={(e: any) => { e.target.style.display = 'none' }} />
              <span className="font-black text-primary-700 text-base">تجارنا</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-100">
              تاجر جملة
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Phone/Name badge on mobile */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{session?.user?.name}</div>
              <div className="text-[11px] text-slate-400" dir="ltr">{session?.user?.phone}</div>
            </div>

            {/* Notifications */}
            <Link href="/wholesale/dashboard/notifications" className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifCount > 0 && (
                <span className="notif-dot">{notifCount > 9 ? '9+' : notifCount}</span>
              )}
            </Link>

            {/* Quick logout button on top bar */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-xl text-slate-400 hover:text-danger-600 hover:bg-red-50 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content - clean without motion.div to prevent fixed modals from breaking */}
        <main className="flex-1 min-w-0 w-full max-w-full p-3 sm:p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* ======= Mobile Bottom Navigation Bar (Scrollable for all tabs) ======= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center h-16 px-1">
          {/* Scrollable Nav Items - 100% Identical to Sidebar */}
          <div className="flex flex-1 items-center overflow-x-auto no-scrollbar scroll-smooth gap-1 py-1 h-full">
            {navItems.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={active ? activeTabRef : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 min-w-[68px] flex-shrink-0 transition-all relative rounded-xl h-full select-none',
                    active ? 'text-primary-700 font-bold' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <div className={cn('relative p-1 rounded-lg transition-colors', active && 'bg-primary-50 text-primary-700')}>
                    <item.icon className="w-5 h-5" />
                    {item.href.includes('orders') && notifCount > 0 && (
                      <span className="absolute -top-1 -left-1 bg-danger-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-[68px] text-center leading-tight">
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="wholesale-bottom-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
