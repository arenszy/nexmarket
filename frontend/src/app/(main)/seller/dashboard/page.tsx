'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, ShoppingBag, DollarSign, Clock, Plus, BarChart2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') router.push('/')
  }, [user])

  const { data: stats } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => api.get('/shops/my/dashboard').then((r) => r.data),
    enabled: !!user?.shop,
  })

  const { data: orders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get('/orders/seller?limit=5').then((r) => r.data),
    enabled: !!user?.shop,
  })

  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get(`/products?shopId=${user?.shop?.id}&limit=5`).then((r) => r.data),
    enabled: !!user?.shop,
  })

  const STAT_CARDS = [
    { label: 'Total Produk', value: stats?.totalProducts || 0, icon: Package, color: 'text-blue-500 bg-blue-50' },
    { label: 'Total Pesanan', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-green-500 bg-green-50' },
    { label: 'Total Pendapatan', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-shopee-orange bg-shopee-red-light' },
    { label: 'Pesanan Baru', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500 bg-yellow-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-shopee-text">Dashboard Penjual</h1>
        <Link href="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-shopee-text">{value}</p>
            <p className="text-xs text-shopee-text-light mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-shopee-text">Pesanan Terbaru</h2>
            <Link href="/seller/orders" className="text-shopee-orange text-sm hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {orders?.data?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-shopee-gray-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-shopee-text">#{order.orderNumber}</p>
                  <p className="text-xs text-shopee-text-light">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-xs font-medium text-shopee-orange mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
            {!orders?.data?.length && (
              <p className="text-sm text-shopee-text-light text-center py-4">Belum ada pesanan</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-shopee-text">Produk Saya</h2>
            <Link href="/seller/products" className="text-shopee-orange text-sm hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {products?.data?.map((product: any) => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b border-shopee-gray-border last:border-0">
                <img
                  src={product.images[0] || 'https://via.placeholder.com/40'}
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover border border-shopee-gray-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-shopee-text truncate">{product.name}</p>
                  <p className="text-xs text-shopee-text-light">Stok: {product.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-shopee-orange">{formatPrice(product.price)}</p>
                  <span className={`text-xs ${product.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-400'}`}>
                    {product.status === 'ACTIVE' ? 'Aktif' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
            {!products?.data?.length && (
              <p className="text-sm text-shopee-text-light text-center py-4">Belum ada produk</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
