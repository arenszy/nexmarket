'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

const STATUS_TABS = [
  { label: 'Semua', value: '' },
  { label: 'Bayar', value: 'PENDING_PAYMENT' },
  { label: 'Diproses', value: 'PROCESSING' },
  { label: 'Dikirim', value: 'SHIPPED' },
  { label: 'Selesai', value: 'DELIVERED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
]

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => { if (!user) router.push('/login') }, [user])

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => api.get(`/orders?${activeTab ? `status=${activeTab}` : ''}`).then((r) => r.data),
    enabled: !!user,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-shopee-text mb-4">Pesanan Saya</h1>

      {/* Tabs */}
      <div className="card mb-4 flex overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-shopee-orange text-shopee-orange'
                : 'border-transparent text-shopee-text-light hover:text-shopee-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-shopee-text-light">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map((order: any) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block">
              <div className="card p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-shopee-text-light">#{order.orderNumber}</span>
                    <span className="text-xs text-shopee-text-light ml-3">{formatDate(order.createdAt)}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Image
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/48'}
                        alt={item.productName}
                        width={48} height={48}
                        className="rounded object-cover border border-shopee-gray-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-shopee-text truncate">{item.productName}</p>
                        <p className="text-xs text-shopee-text-light">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-shopee-text">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-xs text-shopee-text-light">+{order.items.length - 2} produk lainnya</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-shopee-gray-border">
                  <span className="text-xs text-shopee-text-light">Total Pesanan</span>
                  <span className="font-semibold text-shopee-orange">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
