import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-shopee-gray-border mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div>
            <h4 className="font-semibold text-shopee-text mb-3">Layanan Pelanggan</h4>
            <ul className="space-y-2 text-shopee-text-light">
              <li><Link href="/help" className="hover:text-shopee-orange">Pusat Bantuan</Link></li>
              <li><Link href="/how-to-buy" className="hover:text-shopee-orange">Cara Berbelanja</Link></li>
              <li><Link href="/returns" className="hover:text-shopee-orange">Pengembalian Barang</Link></li>
              <li><Link href="/contact" className="hover:text-shopee-orange">Hubungi Kami</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-shopee-text mb-3">Tentang ShopeeClone</h4>
            <ul className="space-y-2 text-shopee-text-light">
              <li><Link href="/about" className="hover:text-shopee-orange">Tentang Kami</Link></li>
              <li><Link href="/careers" className="hover:text-shopee-orange">Karir</Link></li>
              <li><Link href="/blog" className="hover:text-shopee-orange">Blog</Link></li>
              <li><Link href="/press" className="hover:text-shopee-orange">Media</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-shopee-text mb-3">Pembayaran</h4>
            <div className="flex flex-wrap gap-2">
              {['Visa', 'Mastercard', 'BCA', 'Mandiri', 'BNI', 'GoPay', 'OVO'].map((p) => (
                <span key={p} className="border border-gray-200 rounded px-2 py-1 text-xs text-shopee-text-light">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-shopee-text mb-3">Pengiriman</h4>
            <div className="flex flex-wrap gap-2">
              {['JNE', 'J&T', 'SiCepat', 'Anteraja', 'Ninja'].map((s) => (
                <span key={s} className="border border-gray-200 rounded px-2 py-1 text-xs text-shopee-text-light">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-shopee-text mb-3">Ikuti Kami</h4>
            <ul className="space-y-2 text-shopee-text-light">
              <li><a href="#" className="hover:text-shopee-orange">Facebook</a></li>
              <li><a href="#" className="hover:text-shopee-orange">Instagram</a></li>
              <li><a href="#" className="hover:text-shopee-orange">TikTok</a></li>
              <li><a href="#" className="hover:text-shopee-orange">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-shopee-gray-border mt-8 pt-6 text-center text-xs text-shopee-text-light">
          <p>© 2024 Nexmarket. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
