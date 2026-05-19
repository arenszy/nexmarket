import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Nexmarket', template: '%s | Nexmarket' },
  description: 'Belanja Online Terpercaya — Jutaan Produk, Harga Terbaik',
  keywords: ['belanja online', 'marketplace', 'nexmarket', 'ecommerce'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Nexmarket',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { background: '#333', color: '#fff', fontSize: '14px' },
              success: { style: { background: '#26AA99' } },
              error: { style: { background: '#EE4D2D' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
