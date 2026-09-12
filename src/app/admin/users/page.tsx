'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserCheck, UserX, Store, ShoppingBag, Loader2, RefreshCw,
  Eye, Trash2, MapPin, ExternalLink, Calendar, Truck, AlertTriangle,
  X, Phone, Mail, FileText, CheckCircle2, ShieldAlert, Package, ClipboardList
} from 'lucide-react'
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

  // Details Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

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
        if (selectedUser?.id === userId) {
          setSelectedUser((prev: any) => prev ? { ...prev, status: newStatus } : null)
        }
        fetchUsers()
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'فشل في حذف الحساب')
        return
      }

      toast.success(data.message || 'تم حذف الحساب بنجاح 🗑️')
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null)
      }
      setUserToDelete(null)
      fetchUsers()
    } catch {
      toast.error('حدث خطأ في الاتصال أثناء حذف الحساب')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-xl sm:text-2xl font-black text-slate-800">إدارة المستخدمين والحسابات</h1>
          <p className="section-subtitle text-xs sm:text-sm">
            عرض وتفاصيل كافة بيانات التجار المسجلين، مواقعهم على الخرائط، جداول التوزيع، وحذف الحسابات
          </p>
        </div>
        <button onClick={fetchUsers} className="btn btn-ghost btn-sm self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pr-9"
            placeholder="بحث بالاسم، رقم الهاتف، أو اسم المحل..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: '', label: 'الكل', icon: null },
            { value: 'WHOLESALE', label: 'تجار الجملة', icon: Store },
            { value: 'RETAIL', label: 'تجار التجزئة', icon: ShoppingBag },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn('btn btn-sm', roleFilter === f.value ? 'btn-primary' : 'btn-ghost')}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th>المستخدم / المحل</th>
                <th>الهاتف</th>
                <th>النوع</th>
                <th>الولاية والبلدية</th>
                <th>الموقع (Google Maps)</th>
                <th>تاريخ التسجيل</th>
                <th>الحالة</th>
                <th className="text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">لا يوجد مستخدمون</td></tr>
              ) : (
                users.map((user, i) => {
                  const profile = user.wholesaleProfile || user.retailProfile
                  return (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                      {/* Name & Owner */}
                      <td>
                        <div className="font-bold text-slate-800 text-sm">
                          {user.wholesaleProfile?.companyName || user.retailProfile?.shopName || 'بدون اسم'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {profile?.ownerName || '-'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td dir="ltr" className="text-slate-600 font-medium text-xs sm:text-sm">
                        {user.phone}
                      </td>

                      {/* Role */}
                      <td>
                        <span className={cn('badge text-xs font-semibold', user.role === 'WHOLESALE' ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-danger-600')}>
                          {user.role === 'WHOLESALE' ? 'تاجر جملة' : 'تاجر تجزئة'}
                        </span>
                      </td>

                      {/* Wilaya & Commune */}
                      <td className="text-slate-600 text-xs">
                        {profile?.wilaya?.nameAr || '-'}
                        {profile?.commune ? ` · ${profile.commune.nameAr}` : ''}
                      </td>

                      {/* Google Maps Link */}
                      <td>
                        {profile?.mapUrl ? (
                          <a
                            href={profile.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-red-50 text-danger-600 hover:bg-red-100 px-2 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>عرض الخريطة</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">غير محدد</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="text-slate-400 text-xs">{formatDate(user.createdAt)}</td>

                      {/* Status */}
                      <td>
                        <span className={cn('badge text-xs font-semibold', user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {user.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* View Full Details Button */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1"
                            title="عرض البيانات الكاملة"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary-600" />
                            <span>التفاصيل</span>
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => toggleStatus(user.id, user.status)}
                            disabled={updatingId === user.id}
                            className={cn(
                              'btn btn-sm text-xs',
                              user.status === 'ACTIVE' ? 'text-amber-700 hover:bg-amber-50' : 'text-green-700 hover:bg-green-50'
                            )}
                            title={user.status === 'ACTIVE' ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                          >
                            {updatingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                              user.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-green-600" />}
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="btn btn-sm text-danger-600 hover:bg-red-50 text-xs"
                            title="حذف الحساب نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-danger-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                    {selectedUser.role === 'WHOLESALE' ? <Store className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">
                      {selectedUser.wholesaleProfile?.companyName || selectedUser.retailProfile?.shopName || 'ملف المستخدم'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{selectedUser.role === 'WHOLESALE' ? 'تاجر جملة' : 'تاجر تجزئة'}</span>
                      <span>·</span>
                      <span className={cn('px-2 py-0.5 rounded-full font-bold text-[10px]', selectedUser.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300')}>
                        {selectedUser.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
                {/* Basic Info Grid */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 text-primary-700">
                    البيانات الشخصية وبيانات الاتصال
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-400 block">اسم المسؤول / الصاحب:</span>
                      <span className="font-bold text-slate-800">
                        {selectedUser.wholesaleProfile?.ownerName || selectedUser.retailProfile?.ownerName || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">رقم الهاتف الأساسي:</span>
                      <span className="font-bold text-slate-800 font-mono" dir="ltr">
                        {selectedUser.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">البريد الإلكتروني:</span>
                      <span className="text-slate-700 font-mono text-xs">
                        {selectedUser.email || 'غير مسجل'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">تاريخ الانضمام والتسجيل:</span>
                      <span className="text-slate-700 text-xs">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Google Maps */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 text-primary-700">
                    العنوان وموقع خرائط Google Maps
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-400 block">الولاية:</span>
                        <span className="font-bold text-slate-800">
                          {selectedUser.wholesaleProfile?.wilaya?.nameAr || selectedUser.retailProfile?.wilaya?.nameAr || 'غير محددة'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">البلدية:</span>
                        <span className="font-bold text-slate-800">
                          {selectedUser.wholesaleProfile?.commune?.nameAr || selectedUser.retailProfile?.commune?.nameAr || 'غير محددة'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">العنوان التفصيلي:</span>
                      <span className="text-slate-700">
                        {selectedUser.wholesaleProfile?.address || selectedUser.retailProfile?.address || 'لم يتم إدخال عنوان تفصيلي'}
                      </span>
                    </div>

                    {/* Google Maps Link Display */}
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-400 block mb-1">موقع المحل على Google Maps:</span>
                      {(selectedUser.wholesaleProfile?.mapUrl || selectedUser.retailProfile?.mapUrl) ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={selectedUser.wholesaleProfile?.mapUrl || selectedUser.retailProfile?.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>فتح الموقع مباشرة في Google Maps 🗺️</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs font-mono" dir="ltr">
                            {selectedUser.wholesaleProfile?.mapUrl || selectedUser.retailProfile?.mapUrl}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          لم يقم المستخدم بربط موقعه على خرائط جوجل حتى الآن
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description if present */}
                {(selectedUser.wholesaleProfile?.description || selectedUser.retailProfile?.description) && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 text-primary-700">
                      وصف المحل / النشاط
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                      {selectedUser.wholesaleProfile?.description || selectedUser.retailProfile?.description}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 text-primary-700">
                    إحصائيات النشاط
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedUser.role === 'WHOLESALE' && (
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                        <div className="text-xl font-black text-blue-700">
                          {selectedUser.wholesaleProfile?._count?.products || 0}
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">إجمالي المنتجات</div>
                      </div>
                    )}
                    <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 text-center">
                      <div className="text-xl font-black text-primary-700">
                        {selectedUser.wholesaleProfile?._count?.orders || selectedUser.retailProfile?._count?.orders || 0}
                      </div>
                      <div className="text-xs text-primary-600 font-semibold">إجمالي الطلبيات</div>
                    </div>
                  </div>
                </div>

                {/* Wholesale Delivery Schedule if available */}
                {selectedUser.role === 'WHOLESALE' && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 text-primary-700 flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      جدول ومناطق التوزيع الأسبوعي لهذا التاجر
                    </h4>
                    {selectedUser.wholesaleProfile?.deliverySchedules?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.wholesaleProfile.deliverySchedules.map((s: any) => (
                          <div key={s.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                                {s.dayNameAr}
                              </span>
                              <span className="font-bold text-slate-800">{s.zoneName}</span>
                              {s.wilaya && <span className="text-slate-400">({s.wilaya.nameAr})</span>}
                            </div>
                            <span className={cn('badge text-[10px]', s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500')}>
                              {s.isActive ? 'نشط' : 'متوقف'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                        لم يقم هذا التاجر بإضافة جدول توزيع أسبوعي بعد
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setUserToDelete(selectedUser)
                  }}
                  className="btn btn-sm bg-red-50 text-danger-700 hover:bg-red-100 text-xs flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الحساب نهائياً</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(selectedUser.id, selectedUser.status)}
                    className={cn(
                      'btn btn-sm text-xs font-bold',
                      selectedUser.status === 'ACTIVE' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-600 text-white hover:bg-green-700'
                    )}
                  >
                    {selectedUser.status === 'ACTIVE' ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn btn-sm btn-ghost text-xs"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border-2 border-red-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-danger-600 mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                تأكيد حذف الحساب نهائياً
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 text-center mb-4">
                هل أنت متأكد من رغبتك في حذف حساب{' '}
                <span className="font-bold text-slate-800">
                  {userToDelete.wholesaleProfile?.companyName || userToDelete.retailProfile?.shopName || userToDelete.phone}
                </span>{' '}
                نهائياً من المنصة؟
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-danger-700 mb-5 leading-relaxed">
                ⚠️ <b>تحذير:</b> سيؤدي هذا الإجراء إلى حذف جميع المنتجات، والطلبيات، والملف الشخصي، وبيانات التوزيع المرتبطة بهذا الحساب بشكل نهائي ولا يمكن استرجاعها أبداً.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="btn btn-sm sm:btn-md bg-danger-600 hover:bg-danger-700 text-white font-bold flex-1 shadow-danger"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{deleting ? 'جاري الحذف...' : 'نعم، احذف الحساب نهائياً'}</span>
                </button>
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={deleting}
                  className="btn btn-sm sm:btn-md btn-ghost"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
