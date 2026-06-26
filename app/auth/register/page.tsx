'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister() {
    if (!name || !email || !password) { setError('Lengkapi semua field ya 💕'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }
    setLoading(true); setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setLoading(false)

    if (error) { setError(error.message); return }
    if (data.user) router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-soft-gradient flex flex-col items-center justify-center px-4 py-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-rose-gradient rounded-2xl flex items-center justify-center shadow-rose-md mb-4">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">Dating Planner</h1>
        <p className="text-ink-muted text-sm mt-1">Mulai perjalanan cinta kalian 💕</p>
      </div>

      <div className="w-full max-w-sm card p-6">
        <h2 className="font-display text-xl font-semibold text-ink mb-5">Buat Akun</h2>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Namamu</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Nama kamu"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="kamu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                placeholder="Min. 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light"
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary w-full py-3.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </div>

        <p className="text-center text-sm text-ink-muted mt-5">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-primary-400 font-semibold">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
