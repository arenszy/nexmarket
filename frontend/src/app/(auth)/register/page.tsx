'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Harus ada huruf besar, kecil, dan angka'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({ email: data.email, password: data.password, name: data.name, phone: data.phone })
      toast.success('Akun berhasil dibuat!')
      router.push('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal mendaftar')
    }
  }

  return (
    <div className="min-h-screen shopee-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-shopee-orange">
              Shopee<span className="text-shopee-text">Clone</span>
            </Link>
            <p className="text-shopee-text-light text-sm mt-1">Buat akun baru</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input {...register('name')} placeholder="Nama Lengkap" className="input-field" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email" className="input-field" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('phone')} type="tel" placeholder="No. HP (opsional)" className="input-field" />
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-shopee-text-light">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <input
                {...register('confirmPassword')}
                type={showPass ? 'text' : 'password'}
                placeholder="Konfirmasi Password"
                className="input-field"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-shopee-text-light">
              Dengan mendaftar, kamu menyetujui{' '}
              <Link href="/terms" className="text-shopee-orange">Syarat & Ketentuan</Link> kami.
            </p>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? 'Memuat...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-shopee-text-light">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-shopee-orange font-medium hover:underline">Masuk</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
