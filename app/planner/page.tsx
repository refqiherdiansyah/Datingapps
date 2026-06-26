'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Heart, Plus, Edit2, Trash2, Share2, Sparkles, ChevronDown, Loader2, MapPin, Clock } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { DatePlan, Mood } from '@/lib/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'romantic',    label: 'Romantis',     emoji: '🌹', color: 'bg-red-100 text-red-500' },
  { value: 'relaxed',     label: 'Santai',       emoji: '☕', color: 'bg-amber-100 text-amber-600' },
  { value: 'adventurous', label: 'Adventurous',  emoji: '🏕️', color: 'bg-green-100 text-green-600' },
  { value: 'fun',         label: 'Fun',          emoji: '🎉', color: 'bg-purple-100 text-purple-600' },
  { value: 'cozy',        label: 'Cozy',         emoji: '🛋️', color: 'bg-blue-100 text-blue-600' },
]

const SUGGESTIONS: Record<Mood, { title: string; description: string; location?: string }[]> = {
  romantic: [
    { title: 'Makan malam di restoran rooftop 🌃', description: 'Nikmati view kota sambil dinner romantis.', location: 'Rooftop Restaurant' },
    { title: 'Piknik senja di taman 🌅', description: 'Bawa bekal dan selimut, duduk santai menikmati langit sore.', location: 'Alun-alun Kota' },
    { title: 'Nonton film di bioskop premium 🎬', description: 'Pilih film favoritmu dan nikmati bareng.', location: 'XXI / CGV' },
  ],
  relaxed: [
    { title: 'Ngopi sore di kafe aesthetic ☕', description: 'Cari kafe instagramable dan habiskan sore.', location: 'Kafe Kekinian' },
    { title: 'Baca buku bareng di perpustakaan 📚', description: 'Pilih buku masing-masing dan baca bareng dalam diam.', location: 'Perpustakaan Kota' },
    { title: 'Netflix & Chill di rumah 🍿', description: 'Pilih serial favorit dan santai bareng di sofa.', location: 'Rumah' },
  ],
  adventurous: [
    { title: 'Hiking ke bukit sekitar kota 🏕️', description: 'Jalani pagi hari dengan trekking seru berdua.', location: 'Bukit Terdekat' },
    { title: 'Wisata kuliner keliling kota 🍜', description: 'Explore tempat makan baru yang belum pernah dicoba.', location: 'Keliling Kota' },
    { title: 'Bersepeda sore hari 🚴', description: 'Sewa sepeda dan explore jalanan baru.', location: 'Area Cycling Track' },
  ],
  fun: [
    { title: 'Main di wahana seru 🎡', description: 'Kunjungi arena bermain atau wahana kota.', location: 'Taman Bermain' },
    { title: 'Karaoke seru berdua 🎤', description: 'Pilih lagu favorit dan bernyanyi sepuasnya.', location: 'Karaoke Box' },
    { title: 'Bowling date 🎳', description: 'Kompetisi seru sambil ketawa bareng.', location: 'Arena Bowling' },
  ],
  cozy: [
    { title: 'Masak bareng di rumah 🍳', description: 'Pilih resep baru dan masak berdua.', location: 'Rumah' },
    { title: 'Board game night 🎲', description: 'Main board game favorit sambil camilan.', location: 'Rumah / Board Game Café' },
    { title: 'Spa & wellness bareng 💆', description: 'Relaksasi berdua di spa atau lakukan perawatan di rumah.', location: 'Spa Terdekat' },
  ],
}

export default function PlannerPage() {
  const supabase = createClient()
  const [userId, setUserId]   = useState('')
  const [plans, setPlans]     = useState<DatePlan[]>([])
  const [mood, setMood]       = useState<Mood>('romantic')
  const [tab, setTab]         = useState<'suggestions' | 'myplanner'>('suggestions')
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<DatePlan | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', mood: 'romantic' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('dates').select('*').eq('user_id', user.id).order('date', { ascending: false })
      setPlans(data ?? [])
    }
    load()
  }, [])

  async function savePlan() {
    if (!form.title) return
    setLoading(true)
    if (editing) {
      const { data } = await supabase.from('dates').update({ ...form }).eq('id', editing.id).select().single()
      setPlans(p => p.map(x => x.id === editing.id ? data : x))
    } else {
      const { data } = await supabase.from('dates').insert({ ...form, user_id: userId }).select().single()
      setPlans(p => [data, ...p])
    }
    setLoading(false); setModal(null); setEditing(null)
    setForm({ title: '', description: '', date: '', time: '', location: '', mood: 'romantic' })
  }

  async function deletePlan(id: string) {
    await supabase.from('dates').delete().eq('id', id)
    setPlans(p => p.filter(x => x.id !== id))
  }

  function openEdit(plan: DatePlan) {
    setEditing(plan)
    setForm({ title: plan.title, description: plan.description, date: plan.date, time: plan.time || '', location: plan.location || '', mood: plan.mood })
    setModal('edit')
  }

  async function addSuggestion(s: { title: string; description: string; location?: string }) {
    const { data } = await supabase.from('dates').insert({
      title: s.title, description: s.description,
      location: s.location, mood, date: new Date().toISOString().slice(0, 10),
      user_id: userId,
    }).select().single()
    setPlans(p => [data, ...p])
    setTab('myplanner')
  }

  function shareToWhatsApp() {
    const text = plans.slice(0, 3).map(p => `📅 ${p.title}\n🗒️ ${p.description}`).join('\n\n')
    const msg = `Sayang, ini rencana date kita 💕\n\n${text}`
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-rose-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">Date Planner 💕</h1>
        <p className="text-white/70 text-sm mt-1">Rencanakan momen indah kalian</p>

        {/* Mood pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`mood-pill ${mood === m.value ? 'selected' : 'border-white/40 text-white/80 bg-white/10'}`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary-100 bg-white sticky top-0 z-10">
        {(['suggestions', 'myplanner'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors
              ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-ink-muted'}`}
          >
            {t === 'suggestions' ? '✨ Saran Hari Ini' : '📋 Planner Ku'}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* Suggestions Tab */}
        {tab === 'suggestions' && (
          <div className="space-y-3 animate-slide-up">
            {SUGGESTIONS[mood].map((s, i) => (
              <div key={i} className="card p-4">
                <h3 className="font-semibold text-ink text-sm">{s.title}</h3>
                <p className="text-xs text-ink-muted mt-1">{s.description}</p>
                {s.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-primary-400" />
                    <span className="text-xs text-ink-muted">{s.location}</span>
                  </div>
                )}
                <button
                  onClick={() => addSuggestion(s)}
                  className="btn-primary mt-3 py-2 text-xs"
                >
                  <Plus className="w-3 h-3" /> Add to Planner
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Planner Tab */}
        {tab === 'myplanner' && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center justify-between mb-1">
              <button onClick={() => { setModal('add'); setEditing(null); setForm({ title: '', description: '', date: '', time: '', location: '', mood: 'romantic' }) }}
                className="btn-primary py-2.5">
                <Plus className="w-4 h-4" /> Tambah Plan
              </button>
              {plans.length > 0 && (
                <button onClick={shareToWhatsApp} className="btn-secondary py-2.5">
                  <Share2 className="w-4 h-4" /> Share 💬
                </button>
              )}
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-primary-200 mx-auto mb-3" />
                <p className="text-ink-muted text-sm">Belum ada rencana date nih</p>
                <p className="text-xs text-ink-light mt-1">Tambah dari saran atau buat sendiri!</p>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink text-sm truncate">{plan.title}</h3>
                      <p className="text-xs text-ink-muted mt-1 line-clamp-2">{plan.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {plan.date && (
                          <span className="flex items-center gap-1 text-xs text-ink-muted">
                            <Clock className="w-3 h-3" />
                            {format(new Date(plan.date), 'd MMM yyyy', { locale: id })}
                          </span>
                        )}
                        {plan.location && (
                          <span className="flex items-center gap-1 text-xs text-ink-muted">
                            <MapPin className="w-3 h-3" /> {plan.location}
                          </span>
                        )}
                        <span className={`badge badge-rose text-[10px]`}>{plan.mood}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(plan)} className="btn-ghost p-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePlan(plan.id)} className="btn-danger p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditing(null) }}
        title={editing ? 'Edit Rencana' : 'Tambah Rencana Date'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Judul *</label>
            <input className="input-field" placeholder="Contoh: Dinner romantis..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Deskripsi</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Cerita rencananya..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Tanggal</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Jam</label>
              <input type="time" className="input-field" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Lokasi</label>
            <input className="input-field" placeholder="Nama tempat..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Mood</label>
            <select className="input-field" value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
              {MOODS.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
            </select>
          </div>
          <button onClick={savePlan} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Rencana'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
