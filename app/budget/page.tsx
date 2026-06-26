'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { BudgetItem } from '@/lib/types'

const CATEGORIES = ['Makan', 'Nonton', 'Transport', 'Kado', 'Hotel', 'Tiket', 'Lainnya']
const CAT_EMOJI: Record<string, string> = {
  Makan: '🍽️', Nonton: '🎬', Transport: '🚗', Kado: '🎁', Hotel: '🏨', Tiket: '🎟️', Lainnya: '💳'
}
const CAT_COLOR: Record<string, string> = {
  Makan: 'bg-orange-100 text-orange-600', Nonton: 'bg-purple-100 text-purple-600',
  Transport: 'bg-blue-100 text-blue-600',  Kado: 'bg-pink-100 text-pink-600',
  Hotel: 'bg-green-100 text-green-600',    Tiket: 'bg-yellow-100 text-yellow-700',
  Lainnya: 'bg-gray-100 text-gray-600',
}

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function BudgetPage() {
  const supabase   = createClient()
  const [items, setItems]         = useState<BudgetItem[]>([])
  const [userId, setUserId]       = useState('')
  const [modal, setModal]         = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing]     = useState<BudgetItem | null>(null)
  const [loading, setLoading]     = useState(false)
  const [filterCat, setFilterCat] = useState('Semua')

  const [form, setForm] = useState({ amount: '', note: '', category: 'Makan' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('budget').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setItems(data ?? [])
    }
    load()
  }, [])

  async function save() {
    if (!form.amount || !form.note) return
    setLoading(true)
    const payload = { amount: Number(form.amount), note: form.note, category: form.category }
    if (editing) {
      const { data } = await supabase.from('budget').update(payload).eq('id', editing.id).select().single()
      setItems(p => p.map(x => x.id === editing.id ? data : x))
    } else {
      const { data } = await supabase.from('budget').insert({ ...payload, user_id: userId }).select().single()
      setItems(p => [data, ...p])
    }
    setLoading(false); setModal(null); setEditing(null)
    setForm({ amount: '', note: '', category: 'Makan' })
  }

  async function del(id: string) {
    await supabase.from('budget').delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  function openEdit(item: BudgetItem) {
    setEditing(item)
    setForm({ amount: String(item.amount), note: item.note, category: item.category })
    setModal('edit')
  }

  const allCats = ['Semua', ...CATEGORIES]
  const filtered = filterCat === 'Semua' ? items : items.filter(i => i.category === filterCat)
  const total    = items.reduce((s, i) => s + Number(i.amount), 0)

  // Category breakdown
  const breakdown = CATEGORIES.map(cat => ({
    cat,
    total: items.filter(i => i.category === cat).reduce((s, i) => s + Number(i.amount), 0),
  })).filter(b => b.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-gold-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">💰 Budget Tracker</h1>
        <p className="text-white/70 text-sm mt-1">Pantau pengeluaran date kalian</p>

        {/* Total */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mt-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs">Total Pengeluaran</p>
            <p className="font-display text-2xl font-bold text-white">{fmt(total)}</p>
          </div>
          <DollarSign className="w-10 h-10 text-white/30" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Breakdown chart */}
        {breakdown.length > 0 && (
          <div className="card p-4">
            <h2 className="section-title text-sm">Pengeluaran per Kategori</h2>
            <div className="space-y-2">
              {breakdown.map(b => (
                <div key={b.cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink">{CAT_EMOJI[b.cat]} {b.cat}</span>
                    <span className="font-semibold text-primary-400">{fmt(b.total)}</span>
                  </div>
                  <div className="h-2 bg-primary-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-gradient rounded-full"
                      style={{ width: `${(b.total / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add button + filter */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1 mr-3">
            {allCats.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`mood-pill text-xs py-1.5 flex-shrink-0 ${filterCat === cat ? 'selected' : ''}`}
              >
                {cat === 'Semua' ? '📋 Semua' : `${CAT_EMOJI[cat]} ${cat}`}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setModal('add'); setEditing(null); setForm({ amount: '', note: '', category: 'Makan' }) }}
            className="btn-primary py-2 px-3 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <TrendingUp className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Belum ada pengeluaran tercatat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <div key={item.id} className="card p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${CAT_COLOR[item.category] || 'bg-gray-100'}`}>
                  {CAT_EMOJI[item.category] || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.note}</p>
                  <p className="text-xs text-ink-muted">{item.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-primary-400 text-sm">{fmt(Number(item.amount))}</span>
                  <button onClick={() => openEdit(item)} className="btn-ghost p-1.5">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => del(item.id)} className="btn-danger p-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditing(null) }}
        title={editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Jumlah (Rp) *</label>
            <input
              type="number"
              className="input-field"
              placeholder="50000"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Keterangan *</label>
            <input
              className="input-field"
              placeholder="Contoh: Makan malam di restoran..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Kategori</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`p-2 rounded-xl text-xs font-medium transition-all
                    ${form.category === cat ? CAT_COLOR[cat] + ' ring-2 ring-offset-1 ring-primary-300' : 'bg-gray-50 text-ink-muted'}`}
                >
                  {CAT_EMOJI[cat]}<br />{cat}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {loading ? 'Menyimpan...' : editing ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
