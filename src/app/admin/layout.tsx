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

function NavLinks({ isActive, onClose }: { isActive: (i: any) => boolean; onClose?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            isActive(item)
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          )}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  // اقفل الـ sidebar لما المسار يتغير
  useEffect(() => { setOpen(false) }, [pathname])

  // امنع scroll الصفحة لما الـ sidebar مفتوح
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen bg-slate-900 flex">

      {/* ===== Desktop Sidebar ===== */}
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
        <NavLinks isActive={isActive} />
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ===== Mobile Overlay ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 md:hidden"
          style={{ zIndex: 9998 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Mobile Sidebar Drawer ===== */}
      <aside
        className="fixed top-0 bottom-0 right-0 w-72 max-w-[85vw] bg-slate-800 md:hidden flex flex-col"
        style={{
          zIndex: 9999,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white text-sm">إدارة تجارنا</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            style={{ zIndex: 10000 }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          <div className="text-xs text-slate-400">المدير</div>
          <div className="text-sm font-semibold text-white truncate">{session?.user?.phone}</div>
        </div>

        {/* Nav */}
        <NavLinks isActive={isActive} onClose={() => setOpen(false)} />

        {/* Logout */}
        <div className="p-3 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
        {/* Header */}
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

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
