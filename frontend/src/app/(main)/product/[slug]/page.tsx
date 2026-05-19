'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Heart, Store, Star, ChevronRight, Minus, Plus, Shield, Truck } from 'lucide-react'
import api from '@/lib/api'
import { formatPrice, getDiscountPercent, formatNumber, formatDate } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import StarRating from '@/components/ui/StarRating'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => api.get(`/reviews/product/${product.id}`).then((r) => r.data),
    enabled: !!product?.id,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div className="text-center py-20">Produk tidak ditemukan</div>

  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : undefined
  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    await addItem(product.id, quantity, selectedVariant || undefined)
  }

  const handleBuyNow = async () => {
    if (!user) { router.push('/login'); return }
    await addItem(product.id, quantity, selectedVariant || undefined)
    router.push('/cart')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-shopee-text-light mb-4">
        <Link href="/" className="hover:text-shopee-orange">Beranda</Link>
        <ChevronRight size={12} />
        <Link href={`/category/${product.category?.slug}`} className="hover:text-shopee-orange">{product.category?.name}</Link>
        <ChevronRight size={12} />
        <span className="text-shopee-text truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-shopee-gray-border">
            <Image
              src={product.images[selectedImage] || 'https://via.placeholder.com/500'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${i === selectedImage ? 'border-shopee-orange' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-lg font-medium text-shopee-text leading-snug">{product.name}</h1>

          {/* Rating & Sales */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-shopee-orange font-medium border-b border-shopee-orange">{product.rating.toFixed(1)}</span>
              <StarRating rating={product.rating} size={14} />
            </div>
            <span className="text-shopee-text-light border-l pl-4">{product._count?.reviews || 0} Penilaian</span>
            <span className="text-shopee-text-light border-l pl-4">{formatNumber(product.sold)} Terjual</span>
          </div>

          {/* Price */}
          <div className="bg-shopee-gray rounded-lg p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-shopee-orange">{formatPrice(price)}</span>
              {comparePrice && comparePrice > price && (
                <>
                  <span className="text-shopee-text-light line-through text-base">{formatPrice(comparePrice)}</span>
                  <span className="badge-orange">{discount}% OFF</span>
                </>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div>
              <p className="text-sm text-shopee-text-light mb-2">Variasi:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      selectedVariant === v.id
                        ? 'border-shopee-orange text-shopee-orange bg-shopee-red-light'
                        : 'border-shopee-gray-border text-shopee-text hover:border-shopee-orange'
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-shopee-text-light">Jumlah:</span>
            <div className="flex items-center border border-shopee-gray-border rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-shopee-text-light">{product.stock} tersedia</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Tambah ke Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 btn-primary"
            >
              Beli Sekarang
            </button>
          </div>

          {product.stock === 0 && (
            <p className="text-red-500 text-sm text-center">Stok habis</p>
          )}

          {/* Guarantees */}
          <div className="flex gap-4 text-xs text-shopee-text-light pt-2 border-t border-shopee-gray-border">
            <div className="flex items-center gap-1"><Shield size={14} className="text-shopee-green" /> Garansi Uang Kembali</div>
            <div className="flex items-center gap-1"><Truck size={14} className="text-shopee-green" /> Pengiriman Cepat</div>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="card p-4 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-shopee-orange/10 flex items-center justify-center">
            <Store size={24} className="text-shopee-orange" />
          </div>
          <div>
            <p className="font-medium text-shopee-text">{product.shop?.name}</p>
            <p className="text-xs text-shopee-text-light">{product.shop?.city}</p>
          </div>
        </div>
        <Link href={`/shop/${product.shop?.slug}`} className="btn-outline text-sm">
          Kunjungi Toko
        </Link>
      </div>

      {/* Description */}
      <div className="card p-4 mt-4">
        <h2 className="font-bold text-shopee-text mb-3 uppercase text-sm tracking-wide">Deskripsi Produk</h2>
        <p className="text-sm text-shopee-text leading-relaxed whitespace-pre-line">
          {product.description || 'Tidak ada deskripsi.'}
        </p>
      </div>

      {/* Reviews */}
      <div className="card p-4 mt-4">
        <h2 className="font-bold text-shopee-text mb-4 uppercase text-sm tracking-wide">
          Penilaian Produk ({reviews?.meta?.total || 0})
        </h2>
        {reviews?.data?.length > 0 ? (
          <div className="space-y-4">
            {reviews.data.map((review: any) => (
              <div key={review.id} className="border-b border-shopee-gray-border pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-shopee-orange/20 flex items-center justify-center text-xs font-bold text-shopee-orange">
                    {review.user.name[0]}
                  </div>
                  <span className="text-sm font-medium">{review.user.name}</span>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-sm text-shopee-text ml-9">{review.comment}</p>
                <p className="text-xs text-shopee-text-light ml-9 mt-1">{formatDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-shopee-text-light text-center py-6">Belum ada penilaian</p>
        )}
      </div>
    </div>
  )
}
