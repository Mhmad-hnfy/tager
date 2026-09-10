import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'تجارنا - من الجملة إلى محلك',
  description: 'منصة تجارية تجمع بين تجار الجملة وتجار التجزئة في الجزائر',
  keywords: 'تجارنا, تجار الجملة, تجار التجزئة, الجزائر, منصة تجارية',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Cairo, sans-serif',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
              },
              error: {
                style: {
                  background: '#fff1f2',
                  color: '#9f1239',
                  border: '1px solid #fecdd3',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
