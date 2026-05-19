'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Upload, X, Plus } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    name: '', categoryId: '', description: '',
    price: '', comparePrice: '', stock: '', weight: '',
    images: [] as string[], tags: '', status: 'ACTIVE',
  })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') router.push('/')
  }, [user])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/products', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Produk berhasil ditambahkan!')
      router.push('/seller/products')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menambahkan produk'),
  })

  const handleImageUrl = () => {
    const url = prompt('Masukkan URL gambar:')
    if (url) setForm(f => ({ ...f, images: [...f.images, url] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId) { toast.error('Pilih kategori'); return }
    createMutation.mutate({
      name: form.name,
      categoryId: form.categoryId,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock),
      weight: form.weight ? Number(form.weight) : undefined,
      images: form.images,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">Tambah Produk Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Informasi Produk</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama Produk *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Masukkan nama produk" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Kategori *</label>
            <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="input-field">
              <option value="">Pilih Kategori</option>
              {(categories || []).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Deskripsi produk..." className="input-field resize-none" />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">Foto Produk</h2>
          <div className="flex flex-wrap gap-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded border border-gray-200 overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleImageUrl}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-shopee-orange hover:text-shopee-orange transition-colors">
              <Plus size={20} />
              <span className="text-xs mt-1">URL</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tambahkan URL gambar produk (Cloudinary, Unsplash, dll)</p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Harga & Stok</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Harga *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="number" required min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="0" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Harga Coret</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="number" min="0" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })}
                  placeholder="0" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stok *</label>
              <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Berat (gram)</label>
              <input type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                placeholder="0" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tags (pisahkan dengan koma)</label>
            <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="elektronik, gadget, hp" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="ACTIVE">Aktif</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded font-medium hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={createMutation.isPending}
            className="flex-1 btn-primary py-2.5 font-semibold disabled:opacity-50">
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  )
}
