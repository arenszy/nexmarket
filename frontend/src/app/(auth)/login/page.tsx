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
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Berhasil masuk!')
      router.push('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Email atau password salah')
    }
  }

  return (
    <div className="min-h-screen shopee-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-shopee-orange">
              Shopee<span className="text-shopee-text">Clone</span>
            </Link>
            <p className="text-shopee-text-light text-sm mt-1">Masuk ke akun kamu</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                className="input-field pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-shopee-text-light"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-shopee-orange hover:underline">
                Lupa Password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-shopee-text-light">
            <p className="font-medium mb-1">Demo Akun:</p>
            <p>Buyer: buyer@shopeeclone.com / Buyer@123456</p>
            <p>Seller: seller@shopeeclone.com / Seller@123456</p>
            <p>Admin: admin@shopeeclone.com / Admin@123456</p>
          </div>

          <div className="mt-6 text-center text-sm text-shopee-text-light">
            Belum punya akun?{' '}
            <Link href="/register" className="text-shopee-orange font-medium hover:underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
