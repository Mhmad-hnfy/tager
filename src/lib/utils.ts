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
    REJECTED: 'تم الرفض',
    READY: 'جاهز',
    COMPLETED: 'مكتمل',
  }
  return labels[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    READY: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function parseImages(images: string): string[] {
  try {
    return JSON.parse(images) as string[]
  } catch {
    return []
  }
}

export function generateOrderNumber(id: string): string {
  return '#' + id.slice(-6).toUpperCase()
}
