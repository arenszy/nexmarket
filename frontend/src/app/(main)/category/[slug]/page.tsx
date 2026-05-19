'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: category } = useQuery({
    queryKey: ['category', params.slug],
    queryFn: () => api.get(`/categories/${params.slug}`).then(r => r.data),
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-by-category', category?.id],
    queryFn: () => api.get(`/products?categoryId=${category.id}&limit=20`).then(r => r.data),
    enabled: !!category?.id,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">{category?.name || params.slug}</h1>
        {products && <p className="text-sm text-gray-400 mt-0.5">{products.meta?.total || 0} produk</p>}
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(products?.data || []).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
