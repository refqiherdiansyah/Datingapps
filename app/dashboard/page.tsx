'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import {
  Heart, Camera, Gamepad2, DollarSign, Calendar,
  Lock, Target, Utensils, Film, Sparkles, LogOut,
  ChevronRight, Star, Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const SURPRISES = [
  '🍜 Coba mie ayam favorit daerah baru bareng!',
  '🌅 Nonton sunset di tempat yang belum pernah dikunjungi.',
  '🎲 Main board game di kafe sambil ngopi hangat.',
  '🌿 Piknik kecil di taman kota dengan bekal buatan sendiri.',
  '🎨 Ikut kelas melukis bareng untuk pertama kali.',
  '🎬 Movie marathon film favorit lama kalian.',
  '🚴 Sewa sepeda dan jelajahi kota tanpa tujuan.',
  '🍳 Masak menu baru bersama di rumah malam ini.',
  '⭐ Baring di bawah bintang dan ceritakan mimpi masing-masing.',
  '📚 Pergi ke toko buku dan pilihkan buku untuk pasangan.',
]

const QUICK_LINKS = [
  { href: '/planner',    icon: Heart,       label: 'Planner',     color: 'bg-rose-gradient' },
  { href: '/scrapbook',  icon: Camera,      label: 'Scrapbook',   color: 'bg-purple-gradient' },
  { href: '/budget',     icon: DollarSign,  label: 'Budget',      color: 'bg-gold-gradient' },
  { href: '/calendar',   icon: Calendar,    label: 'Kalender',    color: 'bg-rose-gradient' },
  { href: '/games',      icon: Gamepad2,    label: 'Games',       color: 'bg-purple-gradient' },
  { href: '/notes',      icon: Lock,        label: 'Notes',       color: 'bg-gold-gradient' },
  { href: '/restaurant', icon: Utensils,    label: 'Restoran',    color: 'bg-rose-gradient' },
  { href: '/movies',     icon: Film,        label: 'Film',        color: 'bg-purple-gradient' },
  { href: '/progress',   icon: Target,      label: 'Progress',    color: 'bg-gold-gradient' },
]

export default function DashboardPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [name, setName]           = useState('Sayang')
  const [surprise, setSurprise]   = useState('')
  const [showSurprise, setShow]   = useState(false)
  const [stats, setStats]         = useState({ dates: 0, photos: 0, budget: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setName(user.user_metadata?.name || user.email?.split('@')[0] || 'Sayang')

      const [{ count: dates }, { count: photos }, { data: bud }] = await Promise.all([
        supabase.from('dates').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('photos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('budget').select('amount').eq('user_id', user.id),
      ])
      const total = (bud ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0)
      setStats({ dates: dates ?? 0, photos: photos ?? 0, budget: total })
    }
    load()
  }, [])

  function handleSurprise() {
    setSurprise(SURPRISES[Math.floor(Math.random() * SURPRISES.length)])
    setShow(true)
    setTimeout(() => setShow(false), 5000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Hero Header */}
      <div className="bg-rose-gradient px-4 pt-10 pb-8 relative overflow-hidden">
        {/* Floating hearts */}
        {['top-4 right-8', 'top-10 right-16', 'top-6 right-28'].map((pos, i) => (
          <span
            key={i}
            className="absolute text-white/30 text-2xl"
            style={{
              top: `${12 + i * 16}px`,
              right: `${20 + i * 24}px`,
              animation: `heartFloat ${3 + i}s ease-out ${i * 0.7}s infinite`,
            }}
          >
            ♥
          </span>
        ))}

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-white/70 text-sm">{greeting},</p>
            <h1 className="font-display text-2xl font-bold text-white mt-0.5">{name} 💕</h1>
            <p className="text-white/70 text-xs mt-1">Hari ini rencana apa nih?</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl bg-white/20 text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { value: stats.dates,  label: 'Date Plans',  icon: '📅' },
            { value: stats.photos, label: 'Memories',    icon: '📸' },
            { value: `Rp${(stats.budget/1000).toFixed(0)}k`, label: 'Total Spent', icon: '💰', raw: true },
          ].map(s => (
            <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-2xl px-3 py-3 text-center">
              <p className="text-xl">{s.icon}</p>
              <p className="font-display font-bold text-white text-lg leading-tight">
                {s.raw ? s.value : s.value}
              </p>
              <p className="text-white/70 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Surprise Me */}
        <div>
          <button
            onClick={handleSurprise}
            className="w-full bg-purple-gradient text-white font-semibold py-4 rounded-2xl
                       shadow-rose-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Zap className="w-5 h-5" />
            Surprise Me! 🎉
          </button>
          {showSurprise && surprise && (
            <div className="mt-2 bg-white rounded-2xl border border-primary-100 shadow-card p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-ink text-sm font-medium">{surprise}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Fitur</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="card p-3 flex flex-col items-center gap-2 active:scale-95 transition-all"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-rose-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-ink text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* WhatsApp quick share */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink text-sm">Share ke WhatsApp 💬</p>
              <p className="text-xs text-ink-muted mt-0.5">Kirim rencana ke pasangan</p>
            </div>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent('Hai sayang! Yuk cek rencana date kita di Dating Planner 💕')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white text-xs font-semibold
                         px-3 py-2 rounded-xl active:scale-95 transition-all"
            >
              <span>💬</span> Share
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
