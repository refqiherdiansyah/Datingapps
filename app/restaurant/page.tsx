'use client'

import { useState } from 'react'
import { MapPin, Star, ExternalLink, Search, Utensils } from 'lucide-react'

const CATEGORIES = ['Semua', 'Kafe', 'Romantis', 'Street Food', 'Fine Dining', 'Seafood', 'Bakso & Mie']

const RESTAURANTS = [
  { id: '1', name: 'Kafe Batu Sendi',         category: 'Kafe',        address: 'Jl. Raya Batu, Malang', rating: 4.7, price: 'Rp 30–60k', emoji: '☕', lat: -7.8807, lng: 112.5280 },
  { id: '2', name: 'Taman Sari Restaurant',    category: 'Romantis',    address: 'Jl. Ijen, Malang',      rating: 4.8, price: 'Rp 80–150k', emoji: '🌹', lat: -7.9666, lng: 112.6326 },
  { id: '3', name: 'Warung Sego Goreng Pak Ndut', category: 'Street Food', address: 'Jl. Semeru, Malang', rating: 4.5, price: 'Rp 15–25k', emoji: '🍛', lat: -7.9795, lng: 112.6263 },
  { id: '4', name: 'The Onyx Restaurant',      category: 'Fine Dining',  address: 'Jl. Trunojoyo, Malang', rating: 4.9, price: 'Rp 150–300k', emoji: '✨', lat: -7.9805, lng: 112.6342 },
  { id: '5', name: 'Lesehan Pesisir',          category: 'Seafood',     address: 'Jl. Dau, Malang',       rating: 4.6, price: 'Rp 50–100k', emoji: '🦐', lat: -7.9262, lng: 112.5840 },
  { id: '6', name: 'Bakso Bakar Pak Man',      category: 'Bakso & Mie', address: 'Jl. Soekarno Hatta, Malang', rating: 4.7, price: 'Rp 20–40k', emoji: '🍜', lat: -7.9638, lng: 112.6480 },
  { id: '7', name: 'Kopi Kenangan Batu',       category: 'Kafe',        address: 'Jl. Dewi Sartika, Batu', rating: 4.5, price: 'Rp 25–50k', emoji: '☕', lat: -7.8671, lng: 112.5242 },
  { id: '8', name: 'Kampoeng Djowo Sekatul',   category: 'Romantis',    address: 'Jl. Pandanlandung, Malang', rating: 4.8, price: 'Rp 60–120k', emoji: '🌿', lat: -7.9200, lng: 112.5700 },
]

export default function RestaurantPage() {
  const [category, setCategory] = useState('Semua')
  const [search, setSearch]     = useState('')

  const filtered = RESTAURANTS.filter(r => {
    const matchCat    = category === 'Semua' || r.category === category
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function openMaps(r: typeof RESTAURANTS[0]) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-rose-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">🍽️ Restaurant Finder</h1>
        <p className="text-white/70 text-sm mt-1">Cari tempat makan romantis bareng</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            placeholder="Cari restoran atau lokasi..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 text-ink text-sm
                       focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-ink-light"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar bg-white border-b border-primary-100 sticky top-0 z-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`mood-pill flex-shrink-0 text-xs py-1.5 ${category === cat ? 'selected' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Restoran tidak ditemukan</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-ink text-sm">{r.name}</h3>
                    <span className="badge badge-rose text-[10px] flex-shrink-0">{r.category}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-amber-600">{r.rating}</span>
                    <span className="text-xs text-ink-light ml-1">· {r.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-ink-light flex-shrink-0" />
                    <span className="text-xs text-ink-muted truncate">{r.address}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openMaps(r)}
                      className="btn-primary py-1.5 text-xs flex-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Buka di Maps
                    </button>
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent(`Sayang, yuk ke ${r.name}! 🍽️\nLokasi: ${r.address}\nRating: ⭐ ${r.rating}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-1.5 text-xs"
                    >
                      💬 Share
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
