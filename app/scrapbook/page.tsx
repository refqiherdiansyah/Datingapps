'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Camera, Plus, Edit2, Trash2, Upload, Heart, X, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { Photo } from '@/lib/types'

export default function ScrapbookPage() {
  const supabase  = createClient()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [photos, setPhotos]       = useState<Photo[]>([])
  const [userId, setUserId]       = useState('')
  const [uploading, setUploading] = useState(false)
  const [editModal, setEditModal] = useState<Photo | null>(null)
  const [caption, setCaption]     = useState('')
  const [preview, setPreview]     = useState<Photo | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('photos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setPhotos(data ?? [])
    }
    load()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('photos').upload(path, file)
    if (uploadError) { alert('Upload gagal: ' + uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
    const { data: newPhoto } = await supabase.from('photos').insert({
      user_id: userId, image_url: publicUrl, caption: '',
    }).select().single()

    if (newPhoto) setPhotos(p => [newPhoto, ...p])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function saveCaption() {
    if (!editModal) return
    const { data } = await supabase.from('photos').update({ caption }).eq('id', editModal.id).select().single()
    setPhotos(p => p.map(ph => ph.id === editModal.id ? data : ph))
    setEditModal(null)
  }

  async function deletePhoto(photo: Photo) {
    // Delete from storage
    const urlParts = photo.image_url.split('/photos/')
    if (urlParts.length > 1) {
      await supabase.storage.from('photos').remove([urlParts[1]])
    }
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos(p => p.filter(ph => ph.id !== photo.id))
    if (preview?.id === photo.id) setPreview(null)
  }

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      {/* Header */}
      <div className="bg-purple-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">📸 Memory Scrapbook</h1>
        <p className="text-white/70 text-sm mt-1">Abadikan setiap momen indah kalian</p>
      </div>

      {/* Upload section */}
      <div className="px-4 py-4">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-primary-300 rounded-2xl py-8 flex flex-col items-center gap-2
                     bg-white hover:bg-primary-50 active:scale-95 transition-all"
        >
          {uploading ? (
            <><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /><p className="text-primary-400 text-sm font-medium">Mengupload foto...</p></>
          ) : (
            <><Upload className="w-8 h-8 text-primary-300" /><p className="text-primary-400 text-sm font-medium">Upload Foto Date</p><p className="text-xs text-ink-muted">Tap untuk memilih foto</p></>
          )}
        </button>
      </div>

      {/* Photo grid */}
      <div className="px-4 pb-4">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Belum ada foto kenangan</p>
            <p className="text-xs text-ink-light mt-1">Upload foto pertama kalian! 💕</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-ink-muted mb-3">{photos.length} kenangan tersimpan 💕</p>
            <div className="grid grid-cols-2 gap-2">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="relative group rounded-2xl overflow-hidden aspect-square bg-primary-50 cursor-pointer shadow-card"
                  onClick={() => setPreview(photo)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover transition-transform duration-300 group-active:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditModal(photo); setCaption(photo.caption) }}
                      className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow-sm"
                    >
                      <Edit2 className="w-3 h-3 text-ink" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo)}
                      className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center shadow-sm"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  {/* Caption */}
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent p-2">
                      <p className="text-white text-[10px] line-clamp-2">{photo.caption}</p>
                    </div>
                  )}
                  {!photo.caption && (
                    <div className="absolute bottom-2 right-2">
                      <Heart className="w-4 h-4 text-white/70 fill-white/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Caption Modal */}
      <Modal
        open={editModal !== null}
        onClose={() => setEditModal(null)}
        title="Edit Caption"
      >
        {editModal && (
          <div className="space-y-4">
            <img src={editModal.image_url} alt="" className="w-full rounded-xl object-cover max-h-48" />
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1.5">Caption</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Tuliskan kenangan indah di sini... 💕"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>
            <button onClick={saveCaption} className="btn-primary w-full py-3">
              <Heart className="w-4 h-4" /> Simpan Caption
            </button>
          </div>
        )}
      </Modal>

      {/* Photo Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/90" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} className="absolute top-6 right-6 text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-sm w-full px-4">
            <img src={preview.image_url} alt="" className="w-full rounded-2xl shadow-rose-lg" />
            {preview.caption && (
              <p className="text-white text-center mt-3 text-sm">{preview.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
