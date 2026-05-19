'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { ChevronRight, Zap, Tag, Truck, Shield } from 'lucide-react'

const CATEGORIES = [
  { name: 'Elektronik', slug: 'electronics', emoji: '📱' },
  { name: 'Fashion', slug: 'fashion', emoji: '👗' },
  { name: 'Rumah & Dapur', slug: 'home-living', emoji: '🏠' },
  { name: 'Olahraga', slug: 'sports', emoji: '⚽' },
  { name: 'Kecantikan', slug: 'beauty', emoji: '💄' },
  { name: 'Makanan', slug: 'food-beverages', emoji: '🍜' },
  { name: 'Buku', slug: 'books', emoji: '📚' },
  { name: 'Mainan', slug: 'toys-games', emoji: '🎮' },
]

export default function HomePage() {
  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products/featured?limit=10').then((r) => r.data),
  })

  const { data: newProducts, isLoading: newLoading } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => api.get('/products?sortBy=createdAt&limit=10').then((r) => r.data),
  })

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/admin/banners').then((r) => r.data).catch(() => []),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

      {/* Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative rounded-lg overflow-hidden h-48 md:h-64 bg-gradient-to-r from-shopee-orange to-shopee-orange-light">
          {banners?.[0] ? (
            <Image src={banners[0].imageUrl} alt={banners[0].title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Flash Sale</div>
                <div className="text-lg opacity-90">Diskon hingga 70%</div>
                <Link href="/flash-sale" className="mt-3 inline-block bg-white text-shopee-orange px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
                  Belanja Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="hidden md:grid grid-rows-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="relative rounded-lg overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              {banners?.[i] ? (
                <Image src={banners[i].imageUrl} alt={banners[i].title} fill className="object-cover" />
              ) : (
                <div className="text-white text-center p-4">
                  <div className="text-2xl font-bold">Promo {i}</div>
                  <div className="text-sm opacity-80">Penawaran Spesial</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: 'Flash Sale', desc: 'Setiap hari', color: 'text-yellow-500' },
          { icon: Truck, label: 'Gratis Ongkir', desc: 'Min. pembelian 0', color: 'text-green-500' },
          { icon: Tag, label: 'Voucher', desc: 'Hemat lebih banyak', color: 'text-blue-500' },
          { icon: Shield, label: 'Belanja Aman', desc: 'Garansi uang kembali', color: 'text-purple-500' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} className="card p-3 flex items-center gap-3">
            <Icon size={24} className={color} />
            <div>
              <div className="text-sm font-semibold text-shopee-text">{label}</div>
              <div className="text-xs text-shopee-text-light">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-shopee-text text-base uppercase tracking-wide">Kategori</h2>
          <Link href="/categories" className="text-shopee-orange text-sm flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-shopee-red-light flex items-center justify-center text-2xl group-hover:bg-shopee-orange/10 transition-colors">
                {cat.emoji}
              </div>
              <span className="text-xs text-shopee-text text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale / Best Sellers */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-shopee-orange fill-shopee-orange" />
            <h2 className="font-bold text-shopee-text text-base uppercase tracking-wide">Terlaris</h2>
          </div>
          <Link href="/search?sortBy=sold" className="text-shopee-orange text-sm flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {featuredLoading
            ? Array(10).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured?.map((p: any) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>

      {/* New Arrivals */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-shopee-text text-base uppercase tracking-wide">Produk Terbaru</h2>
          <Link href="/search?sortBy=createdAt" className="text-shopee-orange text-sm flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {newLoading
            ? Array(10).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : newProducts?.data?.map((p: any) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>

    </div>
  )
}
