'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Target, Plus, Edit2, Trash2, Cloud, Music, Gift, CheckCircle, Circle, Loader2, Heart } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { ProgressMetric, Challenge } from '@/lib/types'

// ── Gift Ideas ──────────────────────────────────────────────────────────
const GIFT_IDEAS = [
  { emoji: '💐', title: 'Buket Bunga Custom', occasion: 'Anniversary', price: 'Rp 150–300k', desc: 'Pilih bunga favoritnya dan buat buket cantik.' },
  { emoji: '📷', title: 'Foto Polaroid Framed', occasion: 'Anniversary', price: 'Rp 50–100k', desc: 'Cetak foto kenangan terbaik kalian dalam bingkai cantik.' },
  { emoji: '🕯️', title: 'Candle Dinner Set', occasion: 'Romantis', price: 'Rp 200–500k', desc: 'Siapkan makan malam romantis di rumah dengan lilin.' },
  { emoji: '🧸', title: 'Boneka Teddy Bear', occasion: 'Ulang Tahun', price: 'Rp 100–250k', desc: 'Klasik tapi selalu bikin hati hangat.' },
  { emoji: '💍', title: 'Cincin Couple', occasion: 'Anniversary', price: 'Rp 200–500k', desc: 'Simbol komitmen yang bisa dipakai sehari-hari.' },
  { emoji: '🎁', title: 'Hamper Coklat', occasion: 'Ulang Tahun', price: 'Rp 100–300k', desc: 'Kumpulkan coklat dan snack favoritnya dalam kotak cantik.' },
  { emoji: '✈️', title: 'Voucher Staycation', occasion: 'Anniversary', price: 'Rp 500k+', desc: 'Getaway romantis ke hotel atau villa.' },
  { emoji: '📖', title: 'Buku Cerita Kita', occasion: 'Valentines', price: 'Rp 150–400k', desc: 'Print foto dan ceritakan perjalanan cinta kalian.' },
  { emoji: '🧖', title: 'Voucher Spa Couple', occasion: 'Romantis', price: 'Rp 300–600k', desc: 'Relaksasi berdua di spa terbaik kota.' },
  { emoji: '🎵', title: 'Custom Song', occasion: 'Anniversary', price: 'Rp 150–500k', desc: 'Pesan lagu original yang bercerita tentang kalian.' },
]

const OCCASIONS = ['Semua', 'Anniversary', 'Ulang Tahun', 'Romantis', 'Valentines']

// ── Progress metrics ────────────────────────────────────────────────────
const DEFAULT_METRICS = [
  { metric: 'Makan bareng', icon: '🍽️', value: 0 },
  { metric: 'Nonton bareng', icon: '🎬', value: 0 },
  { metric: 'Jalan bareng', icon: '🚶', value: 0 },
  { metric: 'Masak bareng', icon: '🍳', value: 0 },
  { metric: 'Foto bareng', icon: '📸', value: 0 },
  { metric: 'Chat per hari', icon: '💬', value: 0 },
]

// ── Playlist presets ─────────────────────────────────────────────────────
const PLAYLISTS = [
  { emoji: '🌹', name: 'Romantic Evening', query: 'romantic+date+songs', platform: 'spotify' },
  { emoji: '☕', name: 'Coffee Date Vibes', query: 'coffee+date+lo-fi', platform: 'youtube' },
  { emoji: '🏕️', name: 'Adventure Together', query: 'road+trip+love+songs', platform: 'spotify' },
  { emoji: '💃', name: 'Dance with Me', query: 'couples+dance+playlist', platform: 'youtube' },
  { emoji: '🌙', name: 'Late Night Feels', query: 'late+night+love+r&b', platform: 'spotify' },
  { emoji: '🎉', name: 'Party for Two', query: 'couple+fun+party', platform: 'youtube' },
]

type TabType = 'progress' | 'challenges' | 'weather' | 'gifts' | 'playlist'

export default function ProgressPage() {
  const supabase = createClient()
  const [userId, setUserId]         = useState('')
  const [tab, setTab]               = useState<TabType>('progress')
  // Progress
  const [metrics, setMetrics]       = useState<ProgressMetric[]>([])
  const [metricModal, setMetricModal] = useState<ProgressMetric | null>(null)
  const [metricVal, setMetricVal]   = useState('')
  // Challenges
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [chalModal, setChalModal]   = useState<'add' | 'edit' | null>(null)
  const [editChal, setEditChal]     = useState<Challenge | null>(null)
  const [chalForm, setChalForm]     = useState({ title: '', description: '', frequency: 'daily' as Challenge['frequency'] })
  // Weather
  const [weather, setWeather]       = useState<any>(null)
  const [wLoading, setWLoading]     = useState(false)
  // Gifts
  const [giftOcc, setGiftOcc]       = useState('Semua')
  const [giftBudget, setGiftBudget] = useState('Semua')
  // Loading
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: prog }, { data: chal }] = await Promise.all([
        supabase.from('progress').select('*').eq('user_id', user.id),
        supabase.from('challenges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      if (!prog || prog.length === 0) {
        const defaults = DEFAULT_METRICS.map(m => ({ ...m, user_id: user.id }))
        const { data: inserted } = await supabase.from('progress').insert(defaults).select()
        setMetrics(inserted ?? [])
      } else {
        setMetrics(prog)
      }
      setChallenges(chal ?? [])
    }
    load()
  }, [])

  // ── Progress ────────────────────────────────────────────────────────
  async function updateMetric() {
    if (!metricModal) return
    const val = Number(metricVal)
    const { data } = await supabase.from('progress').update({ value: val }).eq('id', metricModal.id).select().single()
    setMetrics(p => p.map(m => m.id === metricModal.id ? data : m))
    setMetricModal(null)
  }

  // ── Challenges ──────────────────────────────────────────────────────
  async function saveChal() {
    if (!chalForm.title) return
    setLoading(true)
    if (editChal) {
      const { data } = await supabase.from('challenges').update({ ...chalForm }).eq('id', editChal.id).select().single()
      setChallenges(p => p.map(c => c.id === editChal.id ? data : c))
    } else {
      const { data } = await supabase.from('challenges').insert({ ...chalForm, status: 'pending', user_id: userId }).select().single()
      setChallenges(p => [data, ...p])
    }
    setLoading(false); setChalModal(null); setEditChal(null)
    setChalForm({ title: '', description: '', frequency: 'daily' })
  }

  async function toggleChal(c: Challenge) {
    const status = c.status === 'completed' ? 'pending' : 'completed'
    const { data } = await supabase.from('challenges').update({ status }).eq('id', c.id).select().single()
    setChallenges(p => p.map(x => x.id === c.id ? data : x))
  }

  async function delChal(id: string) {
    await supabase.from('challenges').delete().eq('id', id)
    setChallenges(p => p.filter(c => c.id !== id))
  }

  // ── Weather ─────────────────────────────────────────────────────────
  async function fetchWeather() {
    const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    setWLoading(true)
    try {
      const url = key
        ? `https://api.openweathermap.org/data/2.5/weather?q=Malang,ID&appid=${key}&units=metric&lang=id`
        : null
      if (url) {
        const res = await fetch(url)
        const d   = await res.json()
        setWeather(d)
      } else {
        // Mock fallback
        setWeather({
          name: 'Malang',
          main: { temp: 24, feels_like: 23, humidity: 72 },
          weather: [{ description: 'berawan sebagian', icon: '02d' }],
          wind: { speed: 3.2 },
        })
      }
    } catch { }
    setWLoading(false)
  }

  const OUTFIT: Record<string, string[]> = {
    Clear:  ['👗 Dress ringan & cerah', '🧢 Topi untuk terik', '🕶️ Sunglasses buat kece', '👟 Sneakers putih'],
    Clouds: ['👕 Kaos kasual + cardigan', '👖 Jeans nyaman', '🎒 Tas shoulder kecil'],
    Rain:   ['🧥 Jaket ringan atau hoodie', '☂️ Bawa payung kecil', '👞 Sepatu anti basah', '☕ Rencana indoor plan B'],
    Drizzle:['🧥 Light jacket', '☂️ Payung lipat', '👟 Casual outfit'],
    default:['👗 Outfit nyaman & rapi', '🧥 Bawa outer tipis', '👟 Alas kaki nyaman'],
  }

  function getOutfit(cond: string) {
    return OUTFIT[cond] || OUTFIT.default
  }

  const BUDGETS = ['Semua', '< Rp 100k', 'Rp 100–300k', 'Rp 300k+']

  const filteredGifts = GIFT_IDEAS.filter(g => {
    const matchOcc = giftOcc === 'Semua' || g.occasion === giftOcc
    const matchBud = giftBudget === 'Semua' ||
      (giftBudget === '< Rp 100k'    && (g.price.includes('50') || g.price.includes('100k'))) ||
      (giftBudget === 'Rp 100–300k'  && g.price.includes('100')) ||
      (giftBudget === 'Rp 300k+'     && (g.price.includes('300') || g.price.includes('500') || g.price.includes('600')))
    return matchOcc
  })

  const TABS: { key: TabType; label: string }[] = [
    { key: 'progress',    label: '📊 Progress' },
    { key: 'challenges',  label: '🎯 Challenges' },
    { key: 'weather',     label: '🌤️ Weather' },
    { key: 'gifts',       label: '🎁 Gift Ideas' },
    { key: 'playlist',    label: '🎵 Playlist' },
  ]

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      <div className="bg-gold-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">⭐ Progress & More</h1>
        <p className="text-white/70 text-sm mt-1">Statistik, challenges, dan inspirasi</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-primary-100 bg-white sticky top-0 z-10">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors
              ${tab === t.key ? 'text-primary-400 border-b-2 border-primary-400' : 'text-ink-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">

        {/* ── Progress Tab ── */}
        {tab === 'progress' && (
          <div className="animate-slide-up space-y-3">
            <p className="text-xs text-ink-muted">Tap angka untuk update statistik 💕</p>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => (
                <button key={m.id} onClick={() => { setMetricModal(m); setMetricVal(String(m.value)) }}
                  className="card p-4 text-left active:scale-95 transition-all">
                  <p className="text-2xl">{m.icon || '📊'}</p>
                  <p className="font-display text-2xl font-bold text-primary-400 mt-1">{m.value}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{m.metric}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Challenges Tab ── */}
        {tab === 'challenges' && (
          <div className="animate-slide-up space-y-3">
            <button onClick={() => { setChalModal('add'); setEditChal(null); setChalForm({ title: '', description: '', frequency: 'daily' }) }}
              className="btn-primary w-full py-3">
              <Plus className="w-4 h-4" /> Tambah Challenge
            </button>

            {challenges.length === 0 ? (
              <div className="text-center py-10">
                <Target className="w-12 h-12 text-primary-200 mx-auto mb-3" />
                <p className="text-ink-muted text-sm">Belum ada challenge</p>
                <p className="text-xs text-ink-light mt-1">Buat tantangan seru untuk kalian berdua!</p>
              </div>
            ) : (
              challenges.map(c => (
                <div key={c.id} className={`card p-4 ${c.status === 'completed' ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleChal(c)} className="flex-shrink-0 mt-0.5">
                      {c.status === 'completed'
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <Circle className="w-5 h-5 text-ink-light" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${c.status === 'completed' ? 'line-through text-ink-muted' : 'text-ink'}`}>
                        {c.title}
                      </p>
                      {c.description && <p className="text-xs text-ink-muted mt-1">{c.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-rose text-[10px]">{c.frequency}</span>
                        {c.status === 'completed' && <span className="badge bg-green-100 text-green-600 text-[10px]">✓ Selesai!</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditChal(c); setChalForm({ title: c.title, description: c.description, frequency: c.frequency }); setChalModal('edit') }}
                        className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => delChal(c.id)} className="btn-danger p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Weather Tab ── */}
        {tab === 'weather' && (
          <div className="animate-slide-up space-y-4">
            <button onClick={fetchWeather} disabled={wLoading} className="btn-primary w-full py-3">
              {wLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {wLoading ? 'Memuat cuaca...' : 'Cek Cuaca Sekarang (Malang)'}
            </button>
            {weather && (
              <div className="animate-slide-up space-y-3">
                <div className="card p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl">
                      {weather.main.temp < 20 ? '🥶' : weather.main.temp < 28 ? '☁️' : '☀️'}
                    </div>
                    <div>
                      <p className="font-display text-3xl font-bold text-ink">{Math.round(weather.main.temp)}°C</p>
                      <p className="text-sm text-ink-muted capitalize">{weather.weather?.[0]?.description}</p>
                      <p className="text-xs text-ink-light mt-0.5">📍 {weather.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Feels like', value: `${Math.round(weather.main.feels_like)}°C`, emoji: '🌡️' },
                      { label: 'Kelembaban', value: `${weather.main.humidity}%`, emoji: '💧' },
                      { label: 'Angin', value: `${weather.wind.speed} m/s`, emoji: '💨' },
                    ].map(s => (
                      <div key={s.label} className="bg-surface-soft rounded-xl p-3 text-center">
                        <p className="text-lg">{s.emoji}</p>
                        <p className="text-xs font-semibold text-ink">{s.value}</p>
                        <p className="text-[10px] text-ink-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-4">
                  <h3 className="section-title text-sm">👗 Rekomendasi Outfit</h3>
                  <div className="space-y-2">
                    {getOutfit(weather.weather?.[0]?.main || '').map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-ink">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Gift Ideas Tab ── */}
        {tab === 'gifts' && (
          <div className="animate-slide-up space-y-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {OCCASIONS.map(o => (
                <button key={o} onClick={() => setGiftOcc(o)}
                  className={`mood-pill flex-shrink-0 text-xs py-1.5 ${giftOcc === o ? 'selected' : ''}`}>
                  {o}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredGifts.map((g, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-ink text-sm">{g.title}</h3>
                        <span className="badge badge-rose text-[10px] flex-shrink-0">{g.occasion}</span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1">{g.desc}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-primary-400">{g.price}</span>
                        <a
                          href={`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent(`Sayang, aku mau kasi kamu ${g.title} ${g.emoji}! 🎁`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-green-600 font-medium"
                        >
                          💬 Hint ke pasangan
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Playlist Tab ── */}
        {tab === 'playlist' && (
          <div className="animate-slide-up space-y-3">
            <p className="text-xs text-ink-muted">Pilih playlist sesuai mood date kalian 🎵</p>
            {PLAYLISTS.map((pl, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-gradient rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {pl.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink text-sm">{pl.name}</p>
                  <p className="text-xs text-ink-muted capitalize">{pl.platform}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(pl.query)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-semibold px-2 py-1 rounded-lg"
                  >
                    🎵 Spotify
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(pl.query)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded-lg"
                  >
                    ▶️ YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Edit Modal */}
      <Modal open={!!metricModal} onClose={() => setMetricModal(null)} title={`Update: ${metricModal?.metric}`}>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-5xl">{metricModal?.icon || '📊'}</p>
            <p className="text-ink-muted text-sm mt-2">Berapa kali sudah?</p>
          </div>
          <input type="number" className="input-field text-center text-2xl font-bold" value={metricVal}
            onChange={e => setMetricVal(e.target.value)} min="0" />
          <div className="flex gap-2">
            {[-1, +1, +5, +10].map(n => (
              <button key={n} onClick={() => setMetricVal(v => String(Math.max(0, Number(v) + n)))}
                className="flex-1 py-2 rounded-xl border border-primary-200 text-sm font-semibold text-primary-400 hover:bg-primary-50">
                {n > 0 ? `+${n}` : n}
              </button>
            ))}
          </div>
          <button onClick={updateMetric} className="btn-primary w-full py-3">
            <Heart className="w-4 h-4" /> Simpan
          </button>
        </div>
      </Modal>

      {/* Challenge Modal */}
      <Modal open={chalModal !== null} onClose={() => { setChalModal(null); setEditChal(null) }}
        title={editChal ? 'Edit Challenge' : 'Tambah Challenge'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Judul Challenge *</label>
            <input className="input-field" placeholder="Contoh: Foto bareng tiap weekend 📸"
              value={chalForm.title} onChange={e => setChalForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Deskripsi</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Detailnya..."
              value={chalForm.description} onChange={e => setChalForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-2">Frekuensi</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'once'] as const).map(f => (
                <button key={f} onClick={() => setChalForm(c => ({ ...c, frequency: f }))}
                  className={`py-2 rounded-xl text-xs font-medium transition-all
                    ${chalForm.frequency === f ? 'bg-primary-100 text-primary-500 ring-2 ring-primary-300' : 'bg-gray-50 text-ink-muted'}`}>
                  {f === 'daily' ? '📆 Harian' : f === 'weekly' ? '📅 Mingguan' : '⚡ Sekali'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveChal} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {loading ? 'Menyimpan...' : editChal ? 'Simpan' : 'Tambah Challenge'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
