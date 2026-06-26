'use client'

import { useState } from 'react'
import { Shuffle, RotateCcw, Heart, Zap } from 'lucide-react'

// ─── Truth or Dare ────────────────────────────────────────────────────
const TRUTHS = [
  'Kapan pertama kali kamu suka sama aku?',
  'Apa hal paling memalukan yang pernah kamu lakuin depanku?',
  'Kalau bisa satu hari di mana saja, kamu pilih ke mana?',
  'Apa hal yang kamu sembunyiin dari aku selama ini? 👀',
  'Sebutkan 3 hal yang paling kamu suka dari aku!',
  'Apa dream date versi kamu?',
  'Siapa orang pertama yang langsung kamu ceritain kalau kamu senang?',
  'Apa momen paling romantis yang ingin kamu ulangi bareng aku?',
]
const DARES = [
  'Ucapkan "Aku sayang kamu" dengan suara paling lebay yang bisa kamu buat!',
  'Ceritakan lelucon terburuk yang kamu punya.',
  'Kirimin voice note bilang sayang ke kontak random di HP kamu 😂',
  'Tulis nama aku di tanganmu dengan spidol.',
  'Nyanyikan lagu favorit kita a cappella sekarang!',
  'Lakukan push-up 10x sambil bilang "Aku cinta (nama pasangan)" setiap turun.',
  'Deskripsi aku pakai 5 kata tanpa mikir lama!',
  'Screenshot lockscreen HP kamu dan share ke story sekarang.',
]

// ─── Couple Quiz ──────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: 'Apa warna favorit pasanganmu?', opts: ['Merah', 'Biru', 'Hijau', 'Ungu'] },
  { q: 'Makanan favorit pasanganmu?', opts: ['Nasi goreng', 'Mie ayam', 'Soto', 'Pizza'] },
  { q: 'Apa yang paling disuka pasanganmu saat weekend?', opts: ['Jalan-jalan', 'Nonton film', 'Tidur', 'Masak bareng'] },
  { q: 'Kalau bisa pilih satu destinasi, pasanganmu akan pilih?', opts: ['Bali', 'Eropa', 'Jepang', 'Raja Ampat'] },
  { q: 'Apa hobi rahasia pasanganmu?', opts: ['Main game', 'Nulis diary', 'Nyanyi di kamar mandi', 'Doomscrolling sosmed'] },
]

// ─── Compatibility ────────────────────────────────────────────────────
const COMPAT_Q = [
  { q: 'Kalau weekend bebas, kamu lebih suka...', opts: ['Jalan keluar', 'Berdua di rumah'] },
  { q: 'Cara terbaik merayakan ulang tahun pasangan?', opts: ['Kejutan besar-besaran', 'Makan malam intim berdua'] },
  { q: 'Kamu lebih suka hadiah...', opts: ['Barang mahal & berkesan', 'Pengalaman & kenangan'] },
  { q: 'Saat ribut kecil, kamu lebih suka...', opts: ['Langsung selesaikan', 'Tenang dulu, baru ngobrol'] },
  { q: 'Bahasa cinta utamamu?', opts: ['Kata-kata afirmasi', 'Waktu berkualitas', 'Sentuhan fisik', 'Hadiah', 'Pelayanan'] },
]

// ─── Spin Wheel ───────────────────────────────────────────────────────
const WHEEL_ITEMS = [
  '🍦 Traktir es krim', '💆 Pijit 5 menit', '🎵 Nyanyi bareng',
  '📸 Foto bareng sekarang', '😘 Cium pipi', '🎮 Tangan kamu kalah, tanggung semua!',
  '🤗 Pelukan 30 detik', '🎁 Beli hadiah kecil besok',
]

type GameTab = 'tod' | 'quiz' | 'compat' | 'spin'

export default function GamesPage() {
  const [tab, setTab]           = useState<GameTab>('tod')
  // ToD
  const [todCard, setTodCard]   = useState<string | null>(null)
  const [todType, setTodType]   = useState<'truth' | 'dare'>('truth')
  // Quiz
  const [qIdx, setQIdx]         = useState(0)
  const [qScore, setQScore]     = useState(0)
  const [qDone, setQDone]       = useState(false)
  const [qAns, setQAns]         = useState<string | null>(null)
  // Compat
  const [cIdx, setCIdx]         = useState(0)
  const [cAnswers, setCAnswers] = useState<string[]>([])
  const [cDone, setCDone]       = useState(false)
  // Spin
  const [spinning, setSpinning] = useState(false)
  const [result, setResult]     = useState<string | null>(null)
  const [deg, setDeg]           = useState(0)

  function drawTod(type: 'truth' | 'dare') {
    setTodType(type)
    const list = type === 'truth' ? TRUTHS : DARES
    setTodCard(list[Math.floor(Math.random() * list.length)])
  }

  function answerQuiz(ans: string) {
    setQAns(ans)
    const correct = Math.random() > 0.5
    if (correct) setQScore(s => s + 1)
    setTimeout(() => {
      if (qIdx + 1 >= QUIZ_QUESTIONS.length) setQDone(true)
      else { setQIdx(i => i + 1); setQAns(null) }
    }, 900)
  }

  function resetQuiz() { setQIdx(0); setQScore(0); setQDone(false); setQAns(null) }

  function answerCompat(ans: string) {
    const next = [...cAnswers, ans]
    setCAnswers(next)
    if (cIdx + 1 >= COMPAT_Q.length) setCDone(true)
    else setCIdx(i => i + 1)
  }

  function resetCompat() { setCIdx(0); setCAnswers([]); setCDone(false) }

  function spin() {
    if (spinning) return
    setSpinning(true); setResult(null)
    const extra   = 1800 + Math.random() * 1800
    const newDeg  = deg + extra
    setDeg(newDeg)
    setTimeout(() => {
      const idx = Math.floor(((newDeg % 360) / 360) * WHEEL_ITEMS.length)
      setResult(WHEEL_ITEMS[Math.abs(WHEEL_ITEMS.length - 1 - (idx % WHEEL_ITEMS.length))])
      setSpinning(false)
    }, 3000)
  }

  const TABS: { key: GameTab; label: string }[] = [
    { key: 'tod',    label: '🎯 Truth or Dare' },
    { key: 'quiz',   label: '🧠 Couple Quiz' },
    { key: 'compat', label: '💕 Compatibility' },
    { key: 'spin',   label: '🎡 Spin Wheel' },
  ]

  const compatScore = Math.round((cAnswers.length / COMPAT_Q.length) * 100)

  return (
    <div className="min-h-screen bg-surface-soft safe-pb animate-fade-in">
      <div className="bg-purple-gradient px-4 pt-10 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">🎮 Mini Games</h1>
        <p className="text-white/70 text-sm mt-1">Seru-seruan bareng pasangan!</p>
      </div>

      {/* Tab scroller */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-primary-100 bg-white sticky top-0 z-10">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap
              ${tab === t.key ? 'text-primary-400 border-b-2 border-primary-400' : 'text-ink-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5">
        {/* ── Truth or Dare ── */}
        {tab === 'tod' && (
          <div className="animate-slide-up space-y-4">
            <div className="flex gap-3">
              <button onClick={() => drawTod('truth')} className="flex-1 bg-blue-50 border-2 border-blue-200 text-blue-600 font-semibold py-4 rounded-2xl active:scale-95 transition-all text-sm">
                🤔 Truth
              </button>
              <button onClick={() => drawTod('dare')} className="flex-1 bg-orange-50 border-2 border-orange-200 text-orange-600 font-semibold py-4 rounded-2xl active:scale-95 transition-all text-sm">
                ⚡ Dare
              </button>
            </div>
            {todCard && (
              <div className={`card p-6 text-center animate-bounce-in
                ${todType === 'truth' ? 'border-blue-200' : 'border-orange-200'}`}>
                <p className="text-3xl mb-3">{todType === 'truth' ? '🤔' : '⚡'}</p>
                <span className={`badge mb-3 ${todType === 'truth' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {todType === 'truth' ? 'TRUTH' : 'DARE'}
                </span>
                <p className="font-semibold text-ink text-base leading-relaxed mt-2">{todCard}</p>
                <button onClick={() => drawTod(todType)} className="btn-ghost mt-4 mx-auto">
                  <Shuffle className="w-4 h-4" /> Kartu Lain
                </button>
              </div>
            )}
            {!todCard && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-ink-muted text-sm">Pilih Truth atau Dare untuk mulai!</p>
              </div>
            )}
          </div>
        )}

        {/* ── Couple Quiz ── */}
        {tab === 'quiz' && (
          <div className="animate-slide-up">
            {!qDone ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-ink-muted">Soal {qIdx + 1}/{QUIZ_QUESTIONS.length}</span>
                  <span className="badge badge-rose">Skor: {qScore}</span>
                </div>
                <div className="h-1.5 bg-primary-100 rounded-full">
                  <div className="h-full bg-rose-gradient rounded-full transition-all"
                    style={{ width: `${((qIdx) / QUIZ_QUESTIONS.length) * 100}%` }} />
                </div>
                <div className="card p-5 text-center">
                  <p className="text-2xl mb-3">🧠</p>
                  <p className="font-semibold text-ink">{QUIZ_QUESTIONS[qIdx].q}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {QUIZ_QUESTIONS[qIdx].opts.map(opt => (
                    <button key={opt} onClick={() => !qAns && answerQuiz(opt)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95
                        ${qAns === opt ? 'bg-primary-100 border-primary-400 text-primary-500' : 'bg-white border-primary-100 text-ink'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center animate-bounce-in">
                <p className="text-5xl mb-3">{qScore >= 4 ? '🏆' : qScore >= 2 ? '💕' : '😅'}</p>
                <h3 className="font-display text-xl font-bold text-ink">Kamu tahu pasanganmu!</h3>
                <p className="text-ink-muted text-sm mt-2">Skor kamu: <strong className="text-primary-400">{qScore}/{QUIZ_QUESTIONS.length}</strong></p>
                <p className="text-sm text-ink-muted mt-2">
                  {qScore >= 4 ? 'Kamu sangat mengenal pasanganmu! ❤️' : qScore >= 2 ? 'Lumayan, masih banyak yang bisa dipelajari! 💪' : 'Kenalan lebih dalam yuk! 😄'}
                </p>
                <button onClick={resetQuiz} className="btn-primary mt-5 mx-auto">
                  <RotateCcw className="w-4 h-4" /> Main Lagi
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Compatibility ── */}
        {tab === 'compat' && (
          <div className="animate-slide-up">
            {!cDone ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-muted">Pertanyaan {cIdx + 1}/{COMPAT_Q.length}</span>
                  <span className="badge badge-rose">Compatibility Test</span>
                </div>
                <div className="card p-5 text-center">
                  <p className="text-2xl mb-3">💕</p>
                  <p className="font-semibold text-ink">{COMPAT_Q[cIdx].q}</p>
                </div>
                <div className="space-y-2">
                  {COMPAT_Q[cIdx].opts.map(opt => (
                    <button key={opt} onClick={() => answerCompat(opt)}
                      className="w-full p-4 rounded-xl border-2 border-primary-100 bg-white text-sm font-medium text-ink text-left hover:border-primary-300 hover:bg-primary-50 active:scale-95 transition-all">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center animate-bounce-in">
                <p className="text-5xl mb-3">💑</p>
                <h3 className="font-display text-xl font-bold text-ink">Hasil Compatibility!</h3>
                <div className="mt-4 relative h-6 bg-primary-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-gradient rounded-full transition-all duration-1000"
                    style={{ width: `${65 + Math.random() * 30}%` }} />
                </div>
                <p className="font-display text-3xl font-bold text-primary-400 mt-3">{65 + Math.floor(Math.random() * 30)}%</p>
                <p className="text-ink-muted text-sm mt-2">Kalian cocok banget! Tetap jaga kebersamaan ya 💕</p>
                <div className="bg-primary-50 rounded-xl p-4 mt-4 text-left space-y-1">
                  {cAnswers.map((a, i) => <p key={i} className="text-xs text-ink-muted">• {a}</p>)}
                </div>
                <button onClick={resetCompat} className="btn-primary mt-5 mx-auto">
                  <RotateCcw className="w-4 h-4" /> Coba Lagi
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Spin Wheel ── */}
        {tab === 'spin' && (
          <div className="animate-slide-up flex flex-col items-center">
            <div className="relative w-64 h-64 my-4">
              {/* Wheel */}
              <div
                className="w-full h-full rounded-full border-4 border-primary-300 shadow-rose-md flex items-center justify-center
                           bg-[conic-gradient(from_0deg,#FFB3CC,#FFC2D9,#FFD4CC,#FFE4EC,#D4CCF0,#9B8EC4,#FF8E7A,#FF6B9D)]"
                style={{ transform: `rotate(${deg}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17,0.67,0.21,1)' : 'none' }}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-card flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-400 fill-primary-200" />
                </div>
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-2xl">▼</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-w-xs">
              {WHEEL_ITEMS.map((item, i) => (
                <span key={i} className="badge badge-rose text-[10px]">{item}</span>
              ))}
            </div>
            <button onClick={spin} disabled={spinning} className="btn-primary px-8 py-4 text-base">
              {spinning ? <><Zap className="w-5 h-5 animate-spin" /> Memutar...</> : <><Zap className="w-5 h-5" /> Putar!</>}
            </button>
            {result && !spinning && (
              <div className="card p-5 mt-4 text-center w-full animate-bounce-in">
                <p className="text-3xl mb-2">🎉</p>
                <p className="font-display font-bold text-ink text-lg">{result}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
