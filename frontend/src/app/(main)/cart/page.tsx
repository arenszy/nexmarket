'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, subtotal, isLoading, fetchCart, updateItem, removeItem, selectedIds, toggleSelect, selectAll, clearSelection } = useCartStore()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchCart()
  }, [user])

  const selectedItems = items.filter((i) => selectedIds.includes(i.id))
  const selectedSubtotal = selectedItems.reduce((sum, item) => {
    const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price)
    return sum + price * item.quantity
  }, 0)

  const allSelected = items.length > 0 && selectedIds.length === items.length

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-shopee-text mb-4">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-shopee-text-light mb-4">Keranjang kamu kosong</p>
          <Link href="/" className="btn-primary inline-block">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Header */}
            <div className="card px-4 py-3 flex items-center gap-3 text-sm text-shopee-text-light">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => allSelected ? clearSelection() : selectAll()}
                className="w-4 h-4 accent-shopee-orange"
              />
              <span>Pilih Semua ({items.length})</span>
            </div>

            {/* Group by shop */}
            {Object.entries(
              items.reduce((acc: any, item) => {
                const shopId = item.product.shop.id
                if (!acc[shopId]) acc[shopId] = { shop: item.product.shop, items: [] }
                acc[shopId].items.push(item)
                return acc
              }, {})
            ).map(([shopId, group]: any) => (
              <div key={shopId} className="card overflow-hidden">
                {/* Shop header */}
                <div className="px-4 py-2 border-b border-shopee-gray-border flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-shopee-orange" />
                  <Link href={`/shop/${group.shop.slug}`} className="text-sm font-medium text-shopee-text hover:text-shopee-orange flex items-center gap-1">
                    {group.shop.name} <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Items */}
                {group.items.map((item: any) => {
                  const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price)
                  return (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3 border-b border-shopee-gray-border last:border-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 accent-shopee-orange mt-1"
                      />
                      <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                        <Image
                          src={item.product.images[0] || 'https://via.placeholder.com/80'}
                          alt={item.product.name}
                          width={80} height={80}
                          className="rounded object-cover border border-shopee-gray-border"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.slug}`} className="text-sm text-shopee-text hover:text-shopee-orange line-clamp-2">
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-shopee-text-light mt-0.5">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-shopee-orange font-semibold">{formatPrice(price)}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeItem(item.id)} className="text-shopee-text-light hover:text-red-500 transition-colors">
                              <Trash2 size={15} />
                            </button>
                            <div className="flex items-center border border-shopee-gray-border rounded">
                              <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100">
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100">
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div className="card p-4 sticky top-20">
              <h2 className="font-semibold text-shopee-text mb-4">Ringkasan Belanja</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-shopee-text-light">
                  <span>Subtotal ({selectedIds.length} produk)</span>
                  <span>{formatPrice(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-shopee-text-light">
                  <span>Ongkos Kirim</span>
                  <span className="text-shopee-green">Gratis</span>
                </div>
                <div className="border-t border-shopee-gray-border pt-2 flex justify-between font-semibold text-shopee-text">
                  <span>Total</span>
                  <span className="text-shopee-orange text-lg">{formatPrice(selectedSubtotal)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedIds.length === 0) return
                  router.push(`/checkout?items=${selectedIds.join(',')}`)
                }}
                disabled={selectedIds.length === 0}
                className="btn-primary w-full mt-4 text-center"
              >
                Beli ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
