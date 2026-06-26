'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Calendar, Plus, Edit2, Trash2, Bell, BellOff, Heart, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { CalendarEvent } from '@/lib/types'
import { format, isToday, isTomorrow, differenceInDays, parseISO, isPast } from 'date-fns'
import { id } from 'date-fns/locale'

const EVENT_TYPES = [
  { value: 'anniversary', label: 'Anniversary', emoji: '💍', color: 'bg-red-100 text-red-600' },
  { value: 'birthday',    label: 'Ulang Tahun', emoji: '🎂', color: 'bg-yellow-100 text-yellow-600' },
  { value: 'date',        label: 'Date Plan',   emoji: '❤️', color: 'bg-pink-100 text-pink-600' },
  { value: 'other',       label: 'Lainnya',     emoji: '⭐', color: 'bg-purple-100 text-purple-600' },
]

function getTypeConfig(type: string) {
  return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[3]
}

function getDaysLabel(dateStr: string) {
  const d = parseISO(dateStr)
  if (isToday(d))    return { label: 'Hari ini! 🎉', urgent: true }
  if (isTomorrow(d)) return { label: 'Besok ⏰', urgent: true }
  const days = differenceInDays(d, new Date())
  if (days > 0)  return { label: `${days} hari lagi`, urgent: days <= 7 }
  if (days < 0)  return { label: `${Math.abs(days)} hari lalu`, urgent: false }
  return { label: '', urgent: false }
}

export default function CalendarPage() {
  const supabase  = createClient()
  const [events, setEvents]   = useState<CalendarEvent[]>([])
  const [userId, setUserId]   = useState('')
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter]   = useState<string>('all')

  const [form, setForm] = useState({
    title: '', date: '', type: 'anniversary' as CalendarEvent['type'], reminder: true, color: '#FF6B9D',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('calendar_events').select('*').eq('user_id', user.id).order('date')
      setEvents(data ?? [])
    }
    load()
  }, [])

  async function save() {
    if (!form.title || !form.date) return
    setLoading(true)
    if (editing) {
      const { data } = await supabase.from('calendar_events').update({ ...form }).eq('id', editing.id).select().single()
      setEvents(p => p.map(e => e.id === editing.id ? data : e))
    } else {
      const { data } = await supabase.from('calendar_events').insert({ ...form, user_id: userId }).select().single()
      setEvents(p => [...p, data].sort((a, b) => a.date.localeCompare(b.date)))
    }
    setLoading(false); setModal(null); setEditing(null)
    setForm({ title: '', date: '', type: 'anniversary', reminder: true, color: '#FF6B9D' })
  }

  async function del(id: string) {
    await supabase.from('calendar_events').delete().eq('id', id)
    setEvents(p => p.filter(e => e.id !== id))
  }

  function openEdit(ev: CalendarEvent) {
    setEditing(ev)
    setForm({ title: ev.title, date: ev.date, type: ev.type, reminder: ev.reminder, color: ev.color || '#FF6B9D' })
    setModal('edit')
  }

  const upcoming = events
    .filter(e => !isPast(parseISO(e.date)) || isToday(parseISO(e.date)))
    .slice(0, 3)

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-purple-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">💍 Love Calendar</h1>
        <p className="text-white/70 text-sm mt-1">Catat momen spesial kalian</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="card p-4">
            <h2 className="section-title text-sm">🔔 Akan Datang</h2>
            <div className="space-y-2">
              {upcoming.map(ev => {
                const cfg = getTypeConfig(ev.type)
                const { label, urgent } = getDaysLabel(ev.date)
                return (
                  <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl ${urgent ? 'bg-primary-50 border border-primary-200' : 'bg-surface-soft'}`}>
                    <span className="text-2xl">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{ev.title}</p>
                      <p className="text-xs text-ink-muted">{format(parseISO(ev.date), 'd MMMM yyyy', { locale: id })}</p>
                    </div>
                    {label && <span className={`badge text-[10px] flex-shrink-0 ${urgent ? 'bg-red-100 text-red-600' : 'badge-rose'}`}>{label}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add + filter */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1">
            {[{ v: 'all', l: '📋 Semua' }, ...EVENT_TYPES.map(t => ({ v: t.value, l: `${t.emoji} ${t.label}` }))].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`mood-pill text-xs py-1.5 flex-shrink-0 ${filter === f.v ? 'selected' : ''}`}>
                {f.l}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setModal('add'); setEditing(null); setForm({ title: '', date: '', type: 'anniversary', reminder: true, color: '#FF6B9D' }) }}
            className="btn-primary py-2 px-3 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Events list */}
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Belum ada event tersimpan</p>
            <p className="text-xs text-ink-light mt-1">Tambah anniversary, ultah, atau date plan!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ev => {
              const cfg = getTypeConfig(ev.type)
              const { label, urgent } = getDaysLabel(ev.date)
              const past = isPast(parseISO(ev.date)) && !isToday(parseISO(ev.date))
              return (
                <div key={ev.id} className={`card p-4 ${past ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.color}`}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-ink text-sm">{ev.title}</p>
                        {urgent && !past && <span className="badge bg-red-100 text-red-600 text-[10px] flex-shrink-0">{label}</span>}
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">{format(parseISO(ev.date), 'EEEE, d MMMM yyyy', { locale: id })}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge text-[10px] ${cfg.color}`}>{cfg.label}</span>
                        {ev.reminder ? (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600"><Bell className="w-3 h-3" /> Reminder</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] text-ink-light"><BellOff className="w-3 h-3" /> No reminder</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(ev)} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(ev.id)} className="btn-danger p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditing(null) }}
        title={editing ? 'Edit Event' : 'Tambah Event Spesial'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Judul *</label>
            <input className="input-field" placeholder="Anniversary ke-3 💍" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Tanggal *</label>
            <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">Jenis</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value as CalendarEvent['type'] }))}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                    ${form.type === t.value ? t.color + ' ring-2 ring-offset-1 ring-primary-300' : 'bg-gray-50 text-ink-muted'}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(f => ({ ...f, reminder: !f.reminder }))}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5
                ${form.reminder ? 'bg-primary-400' : 'bg-gray-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.reminder ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-ink">{form.reminder ? '🔔 Reminder aktif' : '🔕 Tanpa reminder'}</span>
          </label>
          <button onClick={save} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Menyimpan...' : editing ? 'Simpan' : 'Tambah Event'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
