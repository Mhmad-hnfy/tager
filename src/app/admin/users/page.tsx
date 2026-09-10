'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserX, Store, ShoppingBag, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

function AdminUsersContent() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [search, roleFilter])

  const toggleStatus = async (userId: string, currentStatus: string) => {
    setUpdatingId(userId)
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(newStatus === 'ACTIVE' ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب')
        fetchUsers()
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">إدارة المستخدمين</h1>
          <p className="section-subtitle">{users.length} مستخدم</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-ghost btn-sm">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pr-9" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[
            { value: '', label: 'الكل', icon: null },
            { value: 'WHOLESALE', label: 'جملة', icon: Store },
            { value: 'RETAIL', label: 'تجزئة', icon: ShoppingBag },
          ].map(f => (
            <button key={f.value} onClick={() => setRoleFilter(f.value)}
              className={cn('btn btn-sm', roleFilter === f.value ? 'btn-primary' : 'btn-ghost')}>
              {f.icon && <f.icon className="w-3 h-3" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>النوع</th>
                <th>الولاية</th>
                <th>تاريخ التسجيل</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">لا يوجد مستخدمون</td></tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="font-medium">{user.wholesaleProfile?.companyName || user.retailProfile?.shopName || '-'}</td>
                    <td dir="ltr" className="text-slate-500">{user.phone}</td>
                    <td>
                      <span className={cn('badge text-xs', user.role === 'WHOLESALE' ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-danger-600')}>
                        {user.role === 'WHOLESALE' ? 'جملة' : 'تجزئة'}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">
                      {user.wholesaleProfile?.wilaya?.nameAr || user.retailProfile?.wilaya?.nameAr || '-'}
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={cn('badge text-xs', user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {user.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        disabled={updatingId === user.id}
                        className={cn('btn btn-sm', user.status === 'ACTIVE' ? 'text-danger-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50')}
                      >
                        {updatingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                          user.status === 'ACTIVE' ? <><UserX className="w-3 h-3" /> إيقاف</> : <><UserCheck className="w-3 h-3" /> تفعيل</>}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <AdminUsersContent />
    </Suspense>
  )
}
