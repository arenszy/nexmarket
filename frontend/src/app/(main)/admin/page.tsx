'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Store, Package, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'ADMIN') router.push('/')
  }, [user])

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  })

  const STAT_CARDS = [
    { label: 'Total Pembeli', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500 bg-blue-50', href: '/admin/users' },
    { label: 'Total Penjual', value: stats?.totalSellers || 0, icon: Store, color: 'text-green-500 bg-green-50', href: '/admin/shops' },
    { label: 'Total Produk', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500 bg-purple-50', href: '/admin/products' },
    { label: 'Total Pesanan', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-yellow-500 bg-yellow-50', href: '/admin/orders' },
    { label: 'Total Pendapatan', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-shopee-orange bg-shopee-red-light', href: '/admin/revenue' },
    { label: 'Toko Pending', value: stats?.pendingShops || 0, icon: AlertCircle, color: 'text-red-500 bg-red-50', href: '/admin/shops?status=PENDING' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-bold text-shopee-text mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-xl font-bold text-shopee-text">{value}</p>
            <p className="text-xs text-shopee-text-light mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-shopee-text">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-shopee-orange text-sm hover:underline">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-shopee-gray-border text-shopee-text-light text-xs">
                <th className="text-left py-2 pr-4">No. Pesanan</th>
                <th className="text-left py-2 pr-4">Pembeli</th>
                <th className="text-left py-2 pr-4">Total</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b border-shopee-gray-border last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-shopee-orange hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-shopee-text">{order.user?.name}</td>
                  <td className="py-2 pr-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="py-2 pr-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="py-2 text-shopee-text-light">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats?.recentOrders?.length && (
            <p className="text-center text-shopee-text-light py-8">Belum ada pesanan</p>
          )}
        </div>
      </div>
    </div>
  )
}
