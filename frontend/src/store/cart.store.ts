import { create } from 'zustand'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  product: {
    id: string; name: string; slug: string; price: number
    comparePrice?: number; images: string[]; stock: number
    shop: { id: string; name: string; slug: string }
  }
  variant?: { id: string; name: string; value: string; price?: number }
}

interface CartState {
  items: CartItem[]
  subtotal: number
  itemCount: number
  isLoading: boolean
  selectedIds: string[]
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  selectedIds: [],

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/cart')
      set({ items: data.items, subtotal: data.subtotal, itemCount: data.itemCount })
    } catch {} finally {
      set({ isLoading: false })
    }
  },

  addItem: async (productId, quantity = 1, variantId) => {
    try {
      await api.post('/cart/items', { productId, quantity, variantId })
      await get().fetchCart()
      toast.success('Produk ditambahkan ke keranjang')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal menambahkan ke keranjang')
    }
  },

  updateItem: async (id, quantity) => {
    try {
      await api.put(`/cart/items/${id}`, { quantity })
      await get().fetchCart()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal update keranjang')
    }
  },

  removeItem: async (id) => {
    try {
      await api.delete(`/cart/items/${id}`)
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        selectedIds: s.selectedIds.filter((sid) => sid !== id),
      }))
      await get().fetchCart()
    } catch {}
  },

  clearCart: async () => {
    try {
      await api.delete('/cart')
      set({ items: [], subtotal: 0, itemCount: 0, selectedIds: [] })
    } catch {}
  },

  toggleSelect: (id) => {
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((i) => i !== id)
        : [...s.selectedIds, id],
    }))
  },

  selectAll: () => set((s) => ({ selectedIds: s.items.map((i) => i.id) })),
  clearSelection: () => set({ selectedIds: [] }),
}))
