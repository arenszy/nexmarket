'use client'

import { useQuery } from '@tanstack/react-query'
import { Star, Package, MapPin } from 'lucide-react'
import api from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatNumber } from '@/lib/utils'

export default function ShopPage({ params }: { params: { slug: string } }) {
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', params.slug],
    queryFn: () => api.get(`/shops/${params.slug}`).then(r => r.data),
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', shop?.id],
    queryFn: () => api.get(`/products?shopId=${shop.id}&limit=20`).then(r => r.data),
    enabled: !!shop?.id,
  })

  if (shopLoading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Shop header */}
      <div className="bg-white rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-shopee-orange">
            {shop?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{shop?.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {shop?.city && (
                <span className="flex items-center gap-1"><MapPin size={13} />{shop.city}</span>
              )}
              <span className="flex items-center gap-1">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                {shop?.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="flex items-center gap-1">
                <Package size={13} />
                {shop?._count?.products || 0} produk
              </span>
            </div>
            {shop?.description && <p className="text-sm text-gray-500 mt-2">{shop.description}</p>}
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="font-semibold text-gray-800 mb-3">Semua Produk</h2>
      {productsLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(products?.data || []).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
