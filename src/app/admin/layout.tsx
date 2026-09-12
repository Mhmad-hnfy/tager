'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Package, ClipboardList,
  FolderOpen, MapPin, Settings, LogOut, Menu, X, Shield, Truck
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
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

        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="text-xs text-slate-400">المدير</div>
          <div className="text-sm font-semibold text-white">{session?.user?.phone}</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
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
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-slate-800 z-50 md:hidden flex flex-col">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <span className="font-black text-white">الإدارة</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive(item) ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen">
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center px-4 sm:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-slate-300 text-sm font-medium">لوحة إدارة تجارنا</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 bg-slate-50">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
