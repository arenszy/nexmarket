'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { MapPin, Plus } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Address {
  id: string
  label: string
  recipientName: string
  phone: string
  street: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { items } = useCartStore()
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [paymentProvider, setPaymentProvider] = useState<'midtrans' | 'stripe'>('midtrans')

  const cartItemIds = searchParams.get('items')?.split(',') || []
  const selectedItems = items.filter((i) => cartItemIds.includes(i.id))

  useEffect(() => { if (!user) router.push('/login') }, [user])

  const { data: addressData } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then((r) => r.data),
    enabled: !!user,
  })

  // Set default address when data loads
  useEffect(() => {
    if (addressData && addressData.length > 0) {
      const def = addressData.find((a) => a.isDefault)
      setSelectedAddress(def ? def.id : addressData[0].id)
    }
  }, [addressData])

  const addresses: Address[] = addressData ?? []

  const subtotal = selectedItems.reduce((sum, item) => {
    const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price)
    return sum + price * item.quantity
  }, 0)

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data).then((r) => r.data),
    onSuccess: async (order) => {
      try {
        if (paymentProvider === 'midtrans') {
          const { data: payment } = await api.post(`/payments/midtrans/${order.id}`)
          if (payment.snapToken && typeof window !== 'undefined') {
            const script = document.createElement('script')
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
            document.head.appendChild(script)
            script.onload = () => {
              (window as any).snap.pay(payment.snapToken, {
                onSuccess: () => { toast.success('Pembayaran berhasil!'); router.push('/orders') },
                onPending: () => { toast('Pembayaran pending'); router.push('/orders') },
                onError: () => toast.error('Pembayaran gagal'),
                onClose: () => toast('Pembayaran dibatalkan'),
              })
            }
          }
        } else {
          router.push(`/checkout/stripe?orderId=${order.id}`)
        }
      } catch {
        toast.error('Gagal memproses pembayaran')
        router.push('/orders')
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Gagal membuat pesanan'),
  })

  const handleCheckout = () => {
    if (!selectedAddress) { toast.error('Pilih alamat pengiriman'); return }
    if (selectedItems.length === 0) { toast.error('Tidak ada produk dipilih'); return }
    createOrderMutation.mutate({ addressId: selectedAddress, cartItemIds, notes, shippingCost: 0 })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-shopee-text mb-4">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {/* Address */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-shopee-orange" />
              <h2 className="font-semibold text-shopee-text">Alamat Pengiriman</h2>
            </div>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      selectedAddress === addr.id
                        ? 'border-shopee-orange bg-shopee-red-light'
                        : 'border-shopee-gray-border hover:border-shopee-orange'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-0.5 accent-shopee-orange"
                    />
                    <div>
                      <p className="text-sm font-medium">{addr.recipientName} · {addr.phone}</p>
                      <p className="text-xs text-shopee-text-light">
                        {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs text-shopee-orange border border-shopee-orange px-1 rounded mt-1 inline-block">
                          Utama
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-shopee-text-light mb-2">Belum ada alamat</p>
                <button
                  onClick={() => router.push('/profile')}
                  className="btn-outline text-sm flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Tambah Alamat
                </button>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="card p-4">
            <h2 className="font-semibold text-shopee-text mb-3">Produk Dipesan</h2>
            <div className="space-y-3">
              {selectedItems.map((item) => {
                const price = item.variant?.price ? Number(item.variant.price) : Number(item.product.price)
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={item.product.images[0] || 'https://via.placeholder.com/56'}
                      alt={item.product.name}
                      width={56} height={56}
                      className="rounded object-cover border border-shopee-gray-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-shopee-text truncate">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-shopee-text-light">{item.variant.value}</p>}
                      <p className="text-xs text-shopee-text-light">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-shopee-orange">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk penjual (opsional)"
                className="input-field text-sm resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-4">
            <h2 className="font-semibold text-shopee-text mb-3">Metode Pembayaran</h2>
            <div className="space-y-2">
              {[
                { value: 'midtrans', label: 'Midtrans (Transfer Bank, E-Wallet, QRIS)', desc: 'GoPay, OVO, DANA, BCA, Mandiri, dll' },
                { value: 'stripe', label: 'Stripe (Kartu Kredit/Debit)', desc: 'Visa, Mastercard, dll' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    paymentProvider === opt.value
                      ? 'border-shopee-orange bg-shopee-red-light'
                      : 'border-shopee-gray-border hover:border-shopee-orange'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentProvider === opt.value}
                    onChange={() => setPaymentProvider(opt.value as 'midtrans' | 'stripe')}
                    className="mt-0.5 accent-shopee-orange"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-shopee-text-light">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-4 h-fit sticky top-20">
          <h2 className="font-semibold text-shopee-text mb-4">Ringkasan Pembayaran</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-shopee-text-light">
              <span>Subtotal ({selectedItems.length} produk)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-shopee-text-light">
              <span>Ongkos Kirim</span>
              <span className="text-shopee-green">Gratis</span>
            </div>
            <div className="border-t border-shopee-gray-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-shopee-orange text-lg">{formatPrice(subtotal)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending || !selectedAddress}
            className="btn-primary w-full mt-4 py-3"
          >
            {createOrderMutation.isPending ? 'Memproses...' : 'Buat Pesanan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Memuat...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
