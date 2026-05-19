'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { formatPrice, formatNumber, getDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  slug: string
  price: number | string
  comparePrice?: number | string
  images: string[]
  rating: number
  sold: number
  shop: { name: string; city?: string }
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()

  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : undefined
  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    await addItem(product.id, 1)
  }

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="card group cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {discount > 0 && (
            <div className="absolute top-1 left-1 badge-orange">{discount}%</div>
          )}
          {/* Quick add to cart */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-shopee-orange text-white text-xs py-2 flex items-center justify-center gap-1 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          >
            <ShoppingCart size={13} />
            Tambah ke Keranjang
          </button>
        </div>

        {/* Info */}
        <div className="p-2">
          <p className="text-xs text-shopee-text line-clamp-2 min-h-[2.5rem] leading-tight">
            {product.name}
          </p>

          <div className="mt-1.5">
            <span className="text-shopee-orange font-semibold text-sm">
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-shopee-text-light text-xs line-through ml-1">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-shopee-text-light">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-shopee-text-light">
              Terjual {formatNumber(product.sold)}
            </span>
          </div>

          {product.shop.city && (
            <p className="text-xs text-shopee-text-light mt-0.5 truncate">{product.shop.city}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
