'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
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

function SidebarContent({
  session,
  isActive,
  onClose,
}: {
  session: any
  isActive: (item: any) => boolean
  onClose?: () => void
}) {
  return (
    <>
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="text-xs text-slate-400">المدير</div>
        <div className="text-sm font-semibold text-white">{session?.user?.phone}</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive(item)
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const close = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 fixed top-0 right-0 bottom-0 z-40">
        <div className="p-5 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-white leading-tight">تجارنا</div>
              <div className="text-xs text-slate-400">لوحة الإدارة</div>
            </div>
          </Link>
        </div>
        <SidebarContent session={session} isActive={isActive} />
      </aside>

      {/* Mobile: Backdrop */}
      <div
        aria-hidden={!sidebarOpen}
        onClick={close}
        className={cn(
          'fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Mobile: Sidebar drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 bottom-0 w-72 bg-slate-800 z-50 md:hidden flex flex-col',
          'transition-transform duration-300 ease-in-out will-change-transform',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2" onClick={close}>
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white">تجارنا</span>
          </Link>
          <button
            onClick={close}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent session={session} isActive={isActive} onClose={close} />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
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
  )
}
