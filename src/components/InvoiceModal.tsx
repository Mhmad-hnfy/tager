'use client'

import { useRef, useState } from 'react'
import {
  Printer, Download, Image as ImageIcon, X, MapPin, Phone,
  Store, ShoppingBag, Calendar, FileText, Loader2, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice, formatDate, generateOrderNumber, getOrderStatusLabel } from '@/lib/utils'

interface InvoiceModalProps {
  order: any
  onClose: () => void
}

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingImg, setDownloadingImg] = useState(false)

  if (!order) return null

  const orderNumber = generateOrderNumber(order.id)

  // Clean Isolated Print Handler (eliminates modal background, ensures crisp RTL vector text)
  const handlePrint = () => {
    if (!invoiceRef.current) {
      window.print()
      return
    }

    try {
      const invoiceElement = invoiceRef.current
      const invoiceHtml = invoiceElement.innerHTML

      // Collect all current stylesheets and fonts
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n')

      const printIframe = document.createElement('iframe')
      printIframe.style.position = 'fixed'
      printIframe.style.right = '-9999px'
      printIframe.style.bottom = '-9999px'
      printIframe.style.width = '0px'
      printIframe.style.height = '0px'
      printIframe.style.border = 'none'

      document.body.appendChild(printIframe)

      const iframeDoc = printIframe.contentWindow?.document
      if (!iframeDoc) {
        window.print()
        return
      }

      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8" />
            <title>فاتورة-${orderNumber}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: #ffffff !important;
                color: #0f172a !important;
                font-family: var(--font-cairo), Cairo, 'Segoe UI', system-ui, -apple-system, sans-serif !important;
                direction: rtl !important;
                text-align: right !important;
              }
              .print-container {
                width: 100% !important;
                max-width: 800px !important;
                margin: 0 auto !important;
                padding: 10px !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${invoiceHtml}
            </div>
          </body>
        </html>
      `)
      iframeDoc.close()

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus()
          printIframe.contentWindow?.print()
        } catch (e) {
          console.error('Print iframe trigger error:', e)
          window.print()
        } finally {
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe)
            }
          }, 1500)
        }
      }, 400)
    } catch (err) {
      console.error('Print error:', err)
      window.print()
    }
  }

  // Download PDF Handler using html-to-image (preserves native Arabic ligatures, bidirectional text, and layout)
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return
    setDownloadingPdf(true)
    const toastId = toast.loading('جاري توليد ملف PDF الفاتورة بجودة عالية...')
    try {
      const { toPng } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      // Use html-to-image with SVG foreignObject rasterization (100% native browser Arabic rendering)
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const img = new window.Image()
      img.src = dataUrl
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true)
        img.onerror = (e) => reject(e)
      })

      const pageWidth = pdf.internal.pageSize.getWidth() // ~210mm
      const pageHeight = pdf.internal.pageSize.getHeight() // ~297mm

      const marginX = 8
      const marginY = 8
      const printableWidth = pageWidth - (marginX * 2)
      const printableHeight = pageHeight - (marginY * 2)

      const imgRatio = img.naturalWidth / img.naturalHeight
      let renderWidth = printableWidth
      let renderHeight = renderWidth / imgRatio

      // Scale proportionally if height exceeds single A4 page
      if (renderHeight > printableHeight) {
        renderHeight = printableHeight
        renderWidth = renderHeight * imgRatio
      }

      const posX = marginX + (printableWidth - renderWidth) / 2
      const posY = marginY

      pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST')
      pdf.save(`فاتورة-طلب-${orderNumber}.pdf`)
      toast.success('تم تنزيل ملف PDF الفاتورة بنجاح! 📄', { id: toastId })
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error('حدث خطأ أثناء تنزيل الفاتورة كـ PDF', { id: toastId })
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Download Image Handler using html-to-image (preserves native Arabic ligatures)
  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return
    setDownloadingImg(true)
    const toastId = toast.loading('جاري تجهيز صورة الفاتورة فائقة الوضوح...')
    try {
      const { toPng } = await import('html-to-image')

      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1.0,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `فاتورة-طلب-${orderNumber}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('تم تنزيل صورة الفاتورة بنجاح! 🖼️', { id: toastId })
    } catch (err) {
      console.error('Image export error:', err)
      toast.error('حدث خطأ أثناء تنزيل صورة الفاتورة', { id: toastId })
    } finally {
      setDownloadingImg(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Action Header - Hidden during print */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-2 print:hidden flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            <span className="font-bold text-sm sm:text-base">فاتورة الطلب {orderNumber}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="btn btn-sm bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1.5"
            >
              {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>تنزيل PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={downloadingImg}
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
            >
              {downloadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>تنزيل صورة PNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Invoice Canvas */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 print:p-0 print:bg-white print:overflow-visible flex-1">
          <div
            ref={invoiceRef}
            id="printable-invoice"
            dir="rtl"
            className="bg-white mx-auto p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-6 print:w-full print:max-w-none text-slate-800"
            style={{
              maxWidth: '820px',
              direction: 'rtl',
              textAlign: 'right',
              fontFamily: 'var(--font-cairo), Cairo, system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Top Official Banner */}
            <div className="border-b-2 border-primary-700 pb-5 mb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Logo & Platform Name */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-xs relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="تجارنا"
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-primary-800 tracking-tight">تـجـارنـا</div>
                    <div className="text-xs text-slate-500 font-semibold">منصة تجارة الجملة والتوزيع B2B</div>
                  </div>
                </div>

                {/* Title & Order Identifiers */}
                <div className="text-right sm:text-left" dir="rtl">
                  <span className="inline-block bg-primary-50 text-primary-800 font-black text-xs sm:text-sm px-3.5 py-1 rounded-lg border border-primary-200 mb-1">
                    فاتورة تسليم واستلام بضاعة
                  </span>
                  <div className="text-sm font-black text-slate-800 tracking-wider font-mono">
                    رقم الفاتورة: {orderNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    التاريخ: {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Header: Wholesale on the Right, Retailer on the Left */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 mb-6" dir="rtl">
              {/* Right: Wholesale Merchant (تاجر الجملة) */}
              <div className="border-l-0 sm:border-l sm:pl-4 border-slate-200/80 pr-1 text-right">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-black text-xs sm:text-sm text-primary-800 uppercase tracking-wide">
                    معلومات تاجر الجملة (المورّد)
                  </span>
                </div>

                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="font-bold text-slate-900 text-base">
                    {order.wholesale?.companyName || 'مؤسسة تجارة الجملة'}
                  </div>
                  {order.wholesale?.ownerName && (
                    <div className="text-slate-600">
                      <span className="text-slate-400">المسؤول:</span> {order.wholesale.ownerName}
                    </div>
                  )}
                  {order.wholesale?.phone && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-primary-600" />
                      <span>{order.wholesale.phone}</span>
                    </div>
                  )}
                  {(order.wholesale?.wilaya || order.wholesale?.commune || order.wholesale?.address) && (
                    <div className="flex items-start gap-1 text-slate-600 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {order.wholesale?.wilaya?.nameAr ? `ولاية ${order.wholesale.wilaya.nameAr}` : ''}
                        {order.wholesale?.commune?.nameAr ? ` · بلدية ${order.wholesale.commune.nameAr}` : ''}
                        {order.wholesale?.address ? ` · ${order.wholesale.address}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Left: Retail Merchant (تاجر التجزئة) */}
              <div className="pr-1 sm:pr-2 text-right">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-danger-100 flex items-center justify-center text-danger-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-black text-xs sm:text-sm text-danger-700 uppercase tracking-wide">
                    معلومات تاجر التجزئة (المستلم)
                  </span>
                </div>

                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="font-bold text-slate-900 text-base">
                    {order.retail?.shopName || 'محل التجزئة'}
                  </div>
                  {order.retail?.ownerName && (
                    <div className="text-slate-600">
                      <span className="text-slate-400">صاحب المحل:</span> {order.retail.ownerName}
                    </div>
                  )}
                  {order.retail?.phone && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-danger-600" />
                      <span>{order.retail.phone}</span>
                    </div>
                  )}
                  {(order.retail?.wilaya || order.retail?.commune || order.retail?.address) && (
                    <div className="flex items-start gap-1 text-slate-600 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {order.retail?.wilaya?.nameAr ? `ولاية ${order.retail.wilaya.nameAr}` : ''}
                        {order.retail?.commune?.nameAr ? ` · بلدية ${order.retail.commune.nameAr}` : ''}
                        {order.retail?.address ? ` · ${order.retail.address}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Retail Google Maps Link */}
                  {order.retail?.mapUrl && (
                    <div className="pt-1.5">
                      <a
                        href={order.retail.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-red-50 text-danger-700 border border-red-200 px-2 py-0.5 rounded-md text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-danger-600" />
                        <span>موقع المحل على Google Maps 📍</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Products Table */}
            <div className="mb-6" dir="rtl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm text-slate-800">تفاصيل المنتجات المطلوبة</h3>
                <span className="text-xs text-slate-400 font-semibold">{order.items?.length || 0} صنف</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right border-collapse text-xs sm:text-sm" dir="rtl">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 text-right">اسم السلعة / المنتج</th>
                      <th className="py-2.5 px-3 text-center">سعر الوحدة</th>
                      <th className="py-2.5 px-3 text-center">الكمية</th>
                      <th className="py-2.5 px-3 text-left">المجموع الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items?.map((item: any, idx: number) => {
                      const itemTotal = (item.price || 0) * (item.quantity || 0)
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 text-right">
                            {item.product?.nameAr || item.product?.nameFr || 'منتج غير محدد'}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                            {formatPrice(item.price)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-left font-bold text-slate-900 font-mono">
                            {formatPrice(itemTotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes if present */}
            {order.notes && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 mb-6 text-xs sm:text-sm text-amber-900 text-right" dir="rtl">
                <span className="font-bold">ملاحظات الطلب: </span>
                <span>{order.notes}</span>
              </div>
            )}

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8" dir="rtl">
              <div className="text-xs text-slate-500 text-right">
                <div>حالة الطلب الحالية: <span className="font-bold text-primary-700">{getOrderStatusLabel(order.status)}</span></div>
                <div className="mt-0.5">الدفع عند تسليم البضاعة لتاجر التجزئة نقداً أو حسب الاتفاق التجاري.</div>
              </div>

              <div className="text-right sm:text-left min-w-[200px]">
                <div className="text-xs text-slate-500">المبلغ الإجمالي المستحق:</div>
                <div className="text-2xl font-black text-primary-700 font-mono">
                  {formatPrice(order.total)}
                </div>
              </div>
            </div>

            {/* Micro Footer Note */}
            <div className="mt-6 text-center text-[10px] text-slate-400" dir="rtl">
              تم إصدار هذه الفاتورة رسمياً عبر منصة تجارنا (Tujaruna B2B Platform) · رقم الطلب: {orderNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

