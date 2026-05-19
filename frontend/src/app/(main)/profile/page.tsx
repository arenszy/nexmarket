'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, MapPin, Lock } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    setForm({ name: user.name, phone: '' })
  }, [user])

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then(r => r.data),
    enabled: !!user,
  })

  useEffect(() => {
    if (profile) setForm({ name: profile.name, phone: profile.phone || '' })
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: (data) => {
      setUser({ ...user!, ...data })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profil berhasil diperbarui')
    },
    onError: () => toast.error('Gagal memperbarui profil'),
  })

  if (!user) return null

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'addresses', label: 'Alamat', icon: MapPin },
    { id: 'security', label: 'Keamanan', icon: Lock },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">Akun Saya</h1>

      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-shopee-orange rounded-full flex items-center justify-center text-white font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    activeTab === id
                      ? 'bg-orange-50 text-shopee-orange font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Profil Saya</h2>
              <form
                onSubmit={e => { e.preventDefault(); updateMutation.mutate(form) }}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email ?? ''}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">No. HP</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+62..."
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Alamat Saya</h2>
                <button className="btn-primary text-sm px-4 py-1.5">+ Tambah Alamat</button>
              </div>
              <p className="text-sm text-gray-400">Fitur manajemen alamat tersedia di halaman ini.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Keamanan Akun</h2>
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast.error('Password baru tidak cocok'); return }
    setIsLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Password berhasil diubah')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Password Saat Ini</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={e => setForm({ ...form, currentPassword: e.target.value })}
          required
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Password Baru</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={e => setForm({ ...form, newPassword: e.target.value })}
          required
          minLength={8}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Konfirmasi Password Baru</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          required
          className="input-field"
        />
      </div>
      <button type="submit" disabled={isLoading} className="btn-primary px-6 py-2 text-sm disabled:opacity-50">
        {isLoading ? 'Menyimpan...' : 'Ubah Password'}
      </button>
    </form>
  )
}
