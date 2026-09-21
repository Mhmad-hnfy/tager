'use client'

import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Package, ClipboardList,
  FolderOpen, MapPin, LogOut, Shield, Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
  { href: '/admin/users', icon: Users, label: 'المستخدمون' },
  { href: '/admin/products', icon: Package, label: 'المنتجات' },
  { href: '/admin/orders', icon: ClipboardList, label: 'الطلبات' },
  { href: '/admin/delivery-schedules', icon: Truck, label: 'جداول ومناطق التوزيع' },
  { href: '/admin/categories', icon: FolderOpen, label: 'الأقسام' },
  { href: '/admin/wilayas', icon: MapPin, label: 'الولايات' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const activeTabRef = useRef<HTMLAnchorElement>(null)

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [pathname])

  const NavLinks = () => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <Link key={item.href} href={item.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            isActive(item) ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          )}>
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* ======= Main Layout ======= */}
      <div className="min-h-screen bg-slate-900 flex">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-800 fixed top-0 right-0 bottom-0 z-30 border-l border-slate-700">
          <div className="p-5 border-b border-slate-700">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-white leading-tight">تجارنا</div>
                <div className="text-xs text-slate-400">لوحة الإدارة</div>
              </div>
            </Link>
          </div>
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="text-xs text-slate-400">المدير</div>
            <div className="text-sm font-semibold text-white truncate">{session?.user?.phone}</div>
          </div>
          <NavLinks />
          <div className="p-3 border-t border-slate-700 flex-shrink-0">
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-all">
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 md:mr-64 flex flex-col min-h-screen">

          {/* Mobile Top Header */}
          <header className="md:hidden bg-slate-800 border-b border-slate-700 h-14 flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm">لوحة الإدارة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">{session?.user?.phone}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Desktop Top Header */}
          <header className="hidden md:flex bg-slate-800 border-b border-slate-700 h-16 items-center justify-between px-6 gap-4 sticky top-0 z-20">
            <span className="text-slate-300 text-sm font-medium">لوحة إدارة تجارنا</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">{session?.user?.phone}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                خروج
              </button>
            </div>
          </header>

          {/* Main Content - extra bottom padding on mobile for bottom nav */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 bg-slate-50 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* ======= Mobile Bottom Navigation Bar (Same as Desktop Sidebar) ======= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
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
                    active ? 'text-primary-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {/* Active indicator line at top */}
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-b-full shadow-sm" />
                  )}
                  <div
                    className={cn(
                      'p-1.5 rounded-xl transition-colors',
                      active ? 'bg-primary-50 text-primary-600' : 'text-slate-400'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] whitespace-nowrap leading-tight text-center',
                      active ? 'text-primary-700 font-bold' : 'text-slate-500 font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 flex-shrink-0 mx-1" />

          {/* Logout button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex flex-col items-center justify-center gap-0.5 px-3 min-w-0 flex-shrink-0 text-red-400 hover:text-red-500 transition-colors h-full"
            aria-label="تسجيل الخروج"
          >
            <div className="p-1.5 rounded-xl transition-colors hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">خروج</span>
          </button>
        </div>
      </nav>
    </>
  )
}
