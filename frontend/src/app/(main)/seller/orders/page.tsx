'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  PAID: { label: 'Proses', value: 'PROCESSING' },
  PROCESSING: { label: 'Kemas', value: 'PACKED' },
  PACKED: { label: 'Kirim', value: 'SHIPPED' },
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeStatus, setActiveStatus] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders-list', activeStatus],
    queryFn: () => api.get(`/orders/seller?${activeStatus ? `status=${activeStatus}` : ''}&limit=20`).then(r => r.data),
    enabled: !!user?.shop,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders-list'] })
      toast.success('Status pesanan diperbarui')
    },
  })

  if (!user) return null

  const STATUS_TABS = [
    { label: 'Semua', value: '' },
    { label: 'Dibayar', value: 'PAID' },
    { label: 'Diproses', value: 'PROCESSING' },
    { label: 'Dikemas', value: 'PACKED' },
    { label: 'Dikirim', value: 'SHIPPED' },
    { label: 'Selesai', value: 'DELIVERED' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">Pesanan Masuk</h1>

      <div className="bg-white rounded-lg mb-4 overflow-x-auto">
        <div className="flex border-b border-gray-100">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeStatus === tab.value ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {(data?.data || []).length === 0 ? (
            <div className="bg-white rounded-lg text-center py-12 text-gray-400">Tidak ada pesanan</div>
          ) : (
            (data?.data || []).map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600">#{order.orderNumber}</span>
                    <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    <span className="text-xs text-gray-500">• {order.user?.name}</span>
                  </div>
                  <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>

                <div className="p-4">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id} className="flex gap-3 mb-2 last:mb-0">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.product?.images?.[0] || 'https://via.placeholder.com/40'} alt=""
                          className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{item.productName}</p>
                        <p className="text-xs text-gray-400">x{item.quantity} • {formatPrice(Number(item.price))}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-shopee-orange">{formatPrice(Number(order.total))}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => updateMutation.mutate({ id: order.id, status: NEXT_STATUS[order.status].value })}
                      disabled={updateMutation.isPending}
                      className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50">
                      {NEXT_STATUS[order.status].label}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
