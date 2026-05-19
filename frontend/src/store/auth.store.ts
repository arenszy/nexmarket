import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  avatar?: string
  shop?: { id: string; slug: string; status: string } | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 })
          Cookies.set('refreshToken', data.refreshToken, { expires: 7 })
          set({ user: data.user })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (dto) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', dto)
          Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 })
          Cookies.set('refreshToken', data.refreshToken, { expires: 7 })
          set({ user: data.user })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        set({ user: null })
      },

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch {
          set({ user: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
