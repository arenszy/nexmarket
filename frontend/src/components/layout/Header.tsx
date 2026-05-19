'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Search, Bell, ChevronDown, User, Package, Heart, LogOut, Store, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { cn } from '@/lib/utils'

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { itemCount, fetchCart } = useCartStore()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) fetchCart()
  }, [user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 shopee-gradient shadow-header">
      {/* Top bar */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-4">
            <Link href="/seller/register" className="hover:text-white/80 transition-colors">
              Buka Toko
            </Link>
            <span className="text-white/40">|</span>
            <Link href="/download" className="hover:text-white/80 transition-colors">
              Download App
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="flex items-center gap-1 hover:text-white/80">
              <Bell size={13} />
              <span>Notifikasi</span>
            </Link>
            <span className="text-white/40">|</span>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 hover:text-white/80"
                >
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown size={12} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded shadow-lg py-1 text-shopee-text animate-fade-in">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                      <User size={15} /> Profil Saya
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                      <Package size={15} /> Pesanan Saya
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                      <Heart size={15} /> Wishlist
                    </Link>
                    {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                      <>
                        <hr className="my-1" />
                        <Link href="/seller/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                          <Store size={15} /> Dashboard Penjual
                        </Link>
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={15} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm w-full text-left text-red-500">
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/register" className="hover:text-white/80">Daftar</Link>
                <span className="text-white/40">|</span>
                <Link href="/login" className="hover:text-white/80">Masuk</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="text-white font-bold text-2xl tracking-tight">
            Shopee<span className="text-yellow-300">Clone</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, toko, atau kategori..."
              className="flex-1 px-4 py-2.5 text-sm text-shopee-text rounded-l outline-none"
            />
            <button
              type="submit"
              className="bg-shopee-orange-dark hover:bg-shopee-orange px-5 py-2.5 rounded-r flex items-center justify-center transition-colors"
            >
              <Search size={18} className="text-white" />
            </button>
          </div>
        </form>

        {/* Cart */}
        <Link href="/cart" className="relative flex-shrink-0 text-white hover:text-white/80 transition-colors">
          <ShoppingCart size={28} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-shopee-orange text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>
      </div>

      {/* Category nav */}
      <div className="max-w-7xl mx-auto px-4 pb-2 flex items-center gap-6 text-white text-xs overflow-x-auto scrollbar-hide">
        {['Flash Sale', 'Elektronik', 'Fashion', 'Rumah & Dapur', 'Olahraga', 'Kecantikan', 'Makanan', 'Buku'].map((cat) => (
          <Link
            key={cat}
            href={`/category/${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
            className="whitespace-nowrap hover:text-yellow-300 transition-colors"
          >
            {cat}
          </Link>
        ))}
      </div>
    </header>
  )
}
