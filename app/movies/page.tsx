'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Film, Search, Star, Plus, Loader2, Calendar, Ticket } from 'lucide-react'
import type { Movie } from '@/lib/types'
import Image from 'next/image'

const LOCAL_EVENTS = [
  { id: 'e1', title: 'Jazz in the Park 🎷', date: '2025-02-14', location: 'Alun-alun Batu', price: 'Rp 50.000', category: 'Musik' },
  { id: 'e2', title: 'Pameran Seni Lokal 🎨', date: '2025-02-20', location: 'Galeri Kota Malang', price: 'Gratis', category: 'Seni' },
  { id: 'e3', title: 'Food Festival Valentine ❤️', date: '2025-02-15', location: 'Lapangan Merdeka Malang', price: 'Rp 25.000', category: 'Kuliner' },
  { id: 'e4', title: 'Night Market Batu ✨', date: '2025-02-22', location: 'Jl. Brantas, Batu', price: 'Gratis', category: 'Market' },
]

export default function MoviesPage() {
  const supabase = createClient()
  const [movies, setMovies]   = useState<Movie[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState<'movies' | 'events'>('movies')
  const [added, setAdded]     = useState<number[]>([])

  async function fetchMovies(query = '') {
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!key) {
      // Fallback mock data when no API key
      setMovies([
        { id: 1, title: 'The Notebook', overview: 'A young couple falls in love in the 1940s.', poster_path: '', release_date: '2004-06-25', vote_average: 7.9, genre_ids: [10749, 18] },
        { id: 2, title: 'La La Land', overview: 'A musician and an aspiring actress chase their dreams.', poster_path: '', release_date: '2016-11-29', vote_average: 8.0, genre_ids: [10402, 18, 10749] },
        { id: 3, title: 'Crazy Rich Asians', overview: 'A New Yorker travels to Singapore for her boyfriend\'s friend\'s wedding.', poster_path: '', release_date: '2018-08-15', vote_average: 6.9, genre_ids: [35, 10749, 18] },
        { id: 4, title: 'To All The Boys I\'ve Loved Before', overview: 'A high school girl\'s secret love letters are exposed.', poster_path: '', release_date: '2018-08-17', vote_average: 7.2, genre_ids: [35, 10749] },
        { id: 5, title: 'Pride & Prejudice', overview: 'Elizabeth Bennet navigates issues of manners, upbringing, morality, and marriage.', poster_path: '', release_date: '2005-09-16', vote_average: 7.8, genre_ids: [18, 10749] },
        { id: 6, title: 'Titanic', overview: 'A seventeen-year-old aristocrat falls in love aboard the ill-fated ship.', poster_path: '', release_date: '1997-11-18', vote_average: 7.9, genre_ids: [18, 10749] },
      ])
      return
    }
    setLoading(true)
    try {
      const url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(query)}&language=id-ID`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=id-ID&page=1`
      const res  = await fetch(url)
      const data = await res.json()
      setMovies(data.results?.slice(0, 12) ?? [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchMovies() }, [])

  async function addToPlanner(movie: Movie) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('dates').insert({
      user_id: user.id, title: `🎬 Nonton ${movie.title}`,
      description: movie.overview, mood: 'romantic', date: new Date().toISOString().slice(0, 10),
    })
    setAdded(a => [...a, movie.id])
  }

  const GENRES: Record<number, string> = { 10749: 'Romance', 18: 'Drama', 35: 'Komedi', 28: 'Aksi', 16: 'Animasi', 10402: 'Musik' }

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      <div className="bg-rose-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">🎬 Movies & Events</h1>
        <p className="text-white/70 text-sm mt-1">Pilih tontonan atau event seru bareng</p>
        {tab === 'movies' && (
          <div className="relative mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="text"
                placeholder="Cari film..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 text-ink text-sm focus:outline-none placeholder-ink-light"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchMovies(search)}
              />
            </div>
            <button onClick={() => fetchMovies(search)} className="bg-white/20 text-white px-4 rounded-xl font-medium text-sm">
              Cari
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary-100 bg-white sticky top-0 z-10">
        {(['movies', 'events'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors
              ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-ink-muted'}`}>
            {t === 'movies' ? '🎬 Film' : '🎟️ Event Lokal'}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === 'movies' && (
          loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              {movies.map(movie => (
                <div key={movie.id} className="card overflow-hidden">
                  <div className="h-36 bg-primary-50 flex items-center justify-center">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-10 h-10 text-primary-200" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-ink text-xs line-clamp-2 leading-tight">{movie.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-amber-600">{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genre_ids.slice(0, 2).map(g => GENRES[g] && (
                        <span key={g} className="badge badge-rose text-[9px]">{GENRES[g]}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => addToPlanner(movie)}
                      disabled={added.includes(movie.id)}
                      className={`mt-2 w-full text-xs py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 transition-all
                        ${added.includes(movie.id)
                          ? 'bg-green-100 text-green-600'
                          : 'btn-primary py-1.5'}`}
                    >
                      {added.includes(movie.id) ? '✓ Added' : <><Plus className="w-3 h-3" /> Add to Planner</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'events' && (
          <div className="space-y-3 animate-slide-up">
            {LOCAL_EVENTS.map(ev => (
              <div key={ev.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink text-sm">{ev.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Calendar className="w-3 h-3" /> {ev.date}
                      </span>
                      <span className="text-xs text-ink-muted">📍 {ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge badge-rose text-[10px]">{ev.category}</span>
                      <span className="text-xs font-semibold text-primary-400">{ev.price}</span>
                    </div>
                  </div>
                  <Ticket className="w-5 h-5 text-primary-300 flex-shrink-0" />
                </div>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent(`Sayang, yuk ke ${ev.title}! 🎟️\nTanggal: ${ev.date}\nLokasi: ${ev.location}\nHarga: ${ev.price}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-3 py-2 text-xs w-full"
                >
                  💬 Share ke Pasangan
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
