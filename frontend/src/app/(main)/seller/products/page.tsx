'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function SellerProductsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) router.push('/login')
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') router.push('/')
  }, [user])

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products-all'],
    queryFn: () => api.get(`/products?shopId=${user?.shop?.id}&limit=50`).then(r => r.data),
    enabled: !!user?.shop,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products-all'] })
      toast.success('Produk dihapus')
    },
  })

  if (!user) return null
  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Produk Saya</h1>
        <Link href="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        {data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-3">Belum ada produk</p>
            <Link href="/seller/products/new" className="btn-primary text-sm">+ Tambah Produk Pertama</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Produk</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Harga</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Stok</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Terjual</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((product: any) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={product.images[0] || 'https://via.placeholder.com/40'} alt=""
                          className="w-full h-full object-cover" />
                      </div>
                      <span className="text-gray-700 line-clamp-1 max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-shopee-orange font-medium">{formatPrice(Number(product.price))}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3 text-gray-600">{product.sold}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${product.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/product/${product.slug}`}
                        className="text-gray-400 hover:text-blue-500 transition-colors"><Eye size={15} /></Link>
                      <Link href={`/seller/products/${product.id}/edit`}
                        className="text-gray-400 hover:text-shopee-orange transition-colors"><Edit size={15} /></Link>
                      <button onClick={() => { if (confirm('Hapus produk ini?')) deleteMutation.mutate(product.id) }}
                        className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
