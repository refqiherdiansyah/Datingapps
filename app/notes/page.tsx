'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lock, Unlock, Plus, Edit2, Trash2, Heart, Clock, Send, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { SecretNote } from '@/lib/types'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { id } from 'date-fns/locale'

export default function NotesPage() {
  const supabase  = createClient()
  const [notes, setNotes]     = useState<SecretNote[]>([])
  const [userId, setUserId]   = useState('')
  const [modal, setModal]     = useState<'add' | 'edit' | 'view' | null>(null)
  const [editing, setEditing] = useState<SecretNote | null>(null)
  const [viewing, setViewing] = useState<SecretNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState<'mine' | 'all'>('all')

  const [form, setForm] = useState({ content: '', unlock_time: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setNotes(data ?? [])
    }
    load()
  }, [])

  function isUnlocked(note: SecretNote) {
    if (!note.unlock_time) return true
    return isPast(parseISO(note.unlock_time))
  }

  async function save() {
    if (!form.content.trim()) return
    setLoading(true)
    if (editing) {
      const { data } = await supabase.from('notes').update({ content: form.content, unlock_time: form.unlock_time }).eq('id', editing.id).select().single()
      setNotes(p => p.map(n => n.id === editing.id ? data : n))
    } else {
      const { data } = await supabase.from('notes').insert({ content: form.content, unlock_time: form.unlock_time, user_id: userId }).select().single()
      setNotes(p => [data, ...p])
    }
    setLoading(false); setModal(null); setEditing(null)
    setForm({ content: '', unlock_time: '' })
  }

  async function del(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(p => p.filter(n => n.id !== id))
  }

  function openEdit(note: SecretNote) {
    setEditing(note)
    setForm({ content: note.content, unlock_time: note.unlock_time || '' })
    setModal('edit')
  }

  function openView(note: SecretNote) {
    if (!isUnlocked(note)) return
    setViewing(note)
    setModal('view')
  }

  function shareNote(note: SecretNote) {
    if (!isUnlocked(note)) return
    const msg = `💌 Pesan rahasia untukmu:\n\n"${note.content}"\n\n— Dari yang menyayangimu 💕`
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || '6285282568462'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Default unlock time: tonight at 8PM
  function defaultUnlock() {
    const d = new Date()
    d.setHours(20, 0, 0, 0)
    if (isPast(d)) d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-purple-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">💌 Secret Notes</h1>
        <p className="text-white/70 text-sm mt-1">Pesan rahasia yang hanya bisa dibuka di waktu tertentu</p>
      </div>

      {/* Info */}
      <div className="mx-4 mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
        <Lock className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-500">Tulis pesan dan atur waktu unlock. Pesan terkunci tidak bisa dibaca sampai waktunya tiba! 🔐</p>
      </div>

      <div className="px-4 py-4">
        {/* Add button */}
        <button
          onClick={() => { setModal('add'); setEditing(null); setForm({ content: '', unlock_time: defaultUnlock() }) }}
          className="btn-primary w-full py-3 mb-4"
        >
          <Plus className="w-4 h-4" /> Tulis Pesan Rahasia
        </button>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Belum ada pesan rahasia</p>
            <p className="text-xs text-ink-light mt-1">Tulis pesan cinta tersembunyi untuk pasanganmu!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => {
              const unlocked = isUnlocked(note)
              return (
                <div key={note.id} className={`card p-4 ${!unlocked ? 'opacity-80' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${unlocked ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {unlocked
                        ? <Unlock className="w-5 h-5 text-green-600" />
                        : <Lock className="w-5 h-5 text-amber-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      {unlocked ? (
                        <p className="text-sm text-ink line-clamp-3 leading-relaxed">
                          "{note.content}"
                        </p>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-amber-600">🔒 Pesan terkunci</p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            Terbuka: {format(parseISO(note.unlock_time), 'd MMM yyyy, HH:mm', { locale: id })}
                          </p>
                        </div>
                      )}
                      {note.unlock_time && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-ink-light" />
                          <span className="text-[10px] text-ink-muted">
                            {unlocked ? 'Dibuka' : 'Unlock'} {format(parseISO(note.unlock_time), 'd MMM HH:mm', { locale: id })}
                          </span>
                          {unlocked && (
                            <span className="badge bg-green-100 text-green-600 text-[9px] ml-1">✓ Unlocked</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {unlocked && (
                        <button onClick={() => openView(note)} className="btn-ghost p-1.5">
                          <Unlock className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => openEdit(note)} className="btn-ghost p-1.5">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(note.id)} className="btn-danger p-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {unlocked && (
                    <button
                      onClick={() => shareNote(note)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-green-50 text-green-600
                                 text-xs font-semibold py-2 rounded-xl active:scale-95 transition-all"
                    >
                      💬 Kirim ke WhatsApp
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => { setModal(null); setEditing(null) }}
        title={editing ? 'Edit Pesan' : '✍️ Tulis Pesan Rahasia'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Isi Pesan *</label>
            <textarea
              className="input-field resize-none"
              rows={5}
              placeholder="Tulis pesan cinta, kejutan, atau kata-kata manis untuk pasanganmu... 💕"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">
              🕐 Waktu Unlock (opsional)
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.unlock_time}
              onChange={e => setForm(f => ({ ...f, unlock_time: e.target.value }))}
            />
            <p className="text-xs text-ink-light mt-1">Kosongkan untuk langsung bisa dibaca</p>
          </div>
          {/* Quick unlock presets */}
          <div>
            <p className="text-xs font-semibold text-ink-muted mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Malam ini (20:00)', hours: 0 },
                { label: 'Besok pagi', hours: 10 },
                { label: '1 minggu', hours: 168 },
              ].map(preset => {
                const d = new Date()
                if (preset.label === 'Malam ini (20:00)') { d.setHours(20, 0, 0, 0); if (isPast(d)) d.setDate(d.getDate() + 1) }
                else if (preset.label === 'Besok pagi') { d.setDate(d.getDate() + 1); d.setHours(8, 0, 0, 0) }
                else d.setHours(d.getHours() + preset.hours)
                return (
                  <button key={preset.label}
                    onClick={() => setForm(f => ({ ...f, unlock_time: d.toISOString().slice(0, 16) }))}
                    className="badge badge-rose cursor-pointer hover:bg-primary-200 text-xs py-1">
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={save} disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Pesan'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={modal === 'view'}
        onClose={() => { setModal(null); setViewing(null) }}
        title="💌 Pesan Tersembunyi"
      >
        {viewing && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-gradient rounded-full flex items-center justify-center mx-auto shadow-rose-md">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="bg-primary-50 rounded-2xl p-5">
              <p className="text-ink font-medium leading-relaxed text-base italic">
                "{viewing.content}"
              </p>
            </div>
            <p className="text-xs text-ink-muted">
              Dibuat: {format(parseISO(viewing.created_at), 'd MMMM yyyy', { locale: id })}
            </p>
            <button
              onClick={() => shareNote(viewing)}
              className="btn-primary w-full py-3"
            >
              💬 Kirim ke WhatsApp Pasangan
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
