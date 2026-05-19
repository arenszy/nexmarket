'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState, Suspense } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import api from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'createdAt' },
  { label: 'Terlaris', value: 'sold' },
  { label: 'Harga Terendah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('category') || ''
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt')
  const [page, setPage] = useState(1)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const sortOrder = sortBy === 'price_asc' ? 'asc' : 'desc'
  const actualSortBy = sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' : sortBy

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, categoryId, sortBy, page, minPrice, maxPrice],
    queryFn: () => {
      const params = new URLSearchParams({
        ...(q && { search: q }),
        ...(categoryId && { categoryId }),
        sortBy: actualSortBy,
        sortOrder,
        page: String(page),
        limit: '20',
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      })
      return api.get(`/products?${params}`).then((r) => r.data)
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {q && (
        <p className="text-sm text-shopee-text-light mb-4">
          Hasil pencarian untuk <span className="text-shopee-orange font-medium">"{q}"</span>
          {data?.meta?.total !== undefined && ` — ${data.meta.total} produk`}
        </p>
      )}

      <div className="flex gap-4">
        {/* Sidebar Filter */}
        <aside className="hidden md:block w-48 flex-shrink-0 space-y-4">
          <div className="card p-3">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Filter
            </h3>

            {/* Categories */}
            <div className="mb-4">
              <p className="text-xs font-medium text-shopee-text-light uppercase mb-2">Kategori</p>
              <div className="space-y-1">
                {categories?.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/search?q=${q}&category=${cat.id}`)}
                    className={`block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-shopee-red-light hover:text-shopee-orange transition-colors ${categoryId === cat.id ? 'text-shopee-orange bg-shopee-red-light' : 'text-shopee-text'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-medium text-shopee-text-light uppercase mb-2">Harga</p>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input-field text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input-field text-xs"
                />
                <button
                  onClick={() => setPage(1)}
                  className="btn-primary w-full text-xs py-1.5"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="card px-4 py-2 flex items-center gap-3 mb-4 text-sm overflow-x-auto">
            <span className="text-shopee-text-light whitespace-nowrap">Urutkan:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setPage(1) }}
                className={`whitespace-nowrap px-3 py-1.5 rounded transition-colors ${
                  sortBy === opt.value
                    ? 'bg-shopee-orange text-white'
                    : 'text-shopee-text hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {isLoading
              ? Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : data?.data?.map((p: any) => <ProductCard key={p.id} product={p} />)
            }
          </div>

          {/* Empty */}
          {!isLoading && data?.data?.length === 0 && (
            <div className="text-center py-16 text-shopee-text-light">
              <p className="text-lg mb-2">Produk tidak ditemukan</p>
              <p className="text-sm">Coba kata kunci lain atau hapus filter</p>
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded text-sm transition-colors ${
                    page === p ? 'bg-shopee-orange text-white' : 'bg-white text-shopee-text hover:bg-gray-100 border border-shopee-gray-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center">Memuat...</div>}>
      <SearchContent />
    </Suspense>
  )
}
