'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Package, ClipboardList,
  FolderOpen, MapPin, LogOut, Menu, X, Shield, Truck
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
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
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

  const SignOutBtn = () => (
    <div className="p-3 border-t border-slate-700 flex-shrink-0">
      <button onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-all">
        <LogOut className="w-5 h-5" />
        تسجيل الخروج
      </button>
    </div>
  )

  return (
    <>
      {/* ======= Mobile Overlay - خارج كل containers ======= */}
      <div
        onClick={() => setOpen(false)}
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          zIndex: 99998,
          display: open ? 'block' : 'none',
        }}
      />

      {/* ======= Mobile Drawer - خارج كل containers ======= */}
      <aside
        className="md:hidden flex flex-col bg-slate-800"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(288px, 85vw)',
          zIndex: 99999,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s ease-in-out',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-white text-sm leading-tight">تجارنا</div>
              <div className="text-xs text-slate-400">لوحة الإدارة</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-shrink-0 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          <div className="text-xs text-slate-400">المدير</div>
          <div className="text-sm font-semibold text-white truncate">{session?.user?.phone}</div>
        </div>

        <NavLinks onClose={() => setOpen(false)} />
        <SignOutBtn />
      </aside>

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
          <SignOutBtn />
        </aside>

        {/* Content */}
        <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
          <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="فتح القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-slate-300 text-sm font-medium">لوحة إدارة تجارنا</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden sm:block">{session?.user?.phone}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                خروج
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
