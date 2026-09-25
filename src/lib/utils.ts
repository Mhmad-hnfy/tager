import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'طلب جديد',
    PROCESSING: 'قيد المعالجة',
    ACCEPTED: 'تم القبول',
    READY: 'جاهز للاستلام',
    OUT_FOR_DELIVERY: 'في الطريق للتسليم (الوصول قريباً)',
    COMPLETED: 'مكتمل',
    REJECTED: 'تم الرفض',
  }
  return labels[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    READY: 'bg-purple-100 text-purple-700',
    OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-800 border border-amber-300',
    COMPLETED: 'bg-gray-100 text-gray-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function parseImages(images: any): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) return parsed
      return [parsed]
    } catch {
      return [images]
    }
  }
  return []
}

export function generateOrderNumber(id: string): string {
  return '#' + id.slice(-6).toUpperCase()
}
