import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Layers,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { shuffle } from '../lib/generateQuiz.js'
import { speakOnce } from '../hooks/useNarration.js'
import { Badge, Button, Card, Formula, Progress, SectionHeader, Toggle, accent } from './ui.jsx'

const DAY = 86400000

const RATINGS = [
  { id: 'again', label: 'Again', tone: 'rose', hint: '10 min', days: 0.007, ease: -0.2 },
  { id: 'hard', label: 'Hard', tone: 'amber', hint: '1 day', days: 1, ease: -0.05 },
  { id: 'good', label: 'Good', tone: 'emerald', hint: '3 days', days: 3, ease: 0.05 },
  { id: 'easy', label: 'Easy', tone: 'cyan', hint: '7 days', days: 7, ease: 0.15 },
]

const TAG_TONE = { Formula: 'cyan', Concept: 'violet', Trap: 'rose', Core: 'emerald', Application: 'amber', Derived: 'cyan' }

function makeCard(c, i) {
  return {
    ...c,
    id: `card-${i}-${c.front.slice(0, 12).replace(/\s+/g, '-')}`,
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
    dueAt: Date.now(),
    lastRating: null,
  }
}

const fmtDue = (card) => {
  const diff = card.dueAt - Date.now()
  if (diff <= 0) return 'due now'
  if (diff < DAY) return `in ${Math.max(10, Math.round(diff / 60000))} min`
  return `in ${Math.round(diff / DAY)} d`
}

const mastery = (card) => Math.min(100, Math.round((card.interval / 21) * 100 + Math.min(card.reps, 4) * 8))

export default function FlashcardHub() {
  const { session, pushToast, voiceOn, setVoiceOn, setTab } = useApp()
  const [deck, setDeck] = useState([])
  const [queue, setQueue] = useState([])
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratings, setRatings] = useState([])
  const [filter, setFilter] = useState('all')
  const [autoSpeak, setAutoSpeak] = useState(false)

  const buildDeck = useCallback(
    (extra = false) => {
      if (!session) return []
      const base = session.flashcards.map(makeCard)
      if (!extra) return base
      const derived = session.steps.map((s, i) =>
        makeCard({ front: `${s.title} — state the key formula`, back: s.formula, tag: 'Derived' }),
      )
      const seen = new Set(base.map((c) => c.front))
      return [...base, ...derived.filter((c) => !seen.has(c.front))]
    },
    [session],
  )

  useEffect(() => {
    if (!session) return
    const d = buildDeck(false)
    setDeck(d)
    setQueue(d.map((c) => c.id))
    setPos(0)
    setFlipped(false)
    setRatings([])
    setFilter('all')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  const current = useMemo(() => {
    const id = queue[pos]
    return deck.find((c) => c.id === id) || null
  }, [deck, queue, pos])

  const reviewed = ratings.length
  const accuracy = reviewed ? Math.round((ratings.filter((r) => r !== 'again').length / reviewed) * 100) : 0
  const dueCount = deck.filter((c) => c.dueAt <= Date.now()).length
  const masteredCount = deck.filter((c) => c.interval >= 21).length
  const learningCount = deck.filter((c) => c.reps > 0 && c.interval < 21).length
  const totalProgress = deck.length ? masteredCount / deck.length : 0
  const queueDone = pos >= queue.length

  const rate = useCallback(
    (ratingId) => {
      if (!current) return
      const r = RATINGS.find((x) => x.id === ratingId)
      setDeck((d) =>
        d.map((c) => {
          if (c.id !== current.id) return c
          const isAgain = ratingId === 'again'
          const baseDays = Math.max(c.interval, 1)
          const nextDays = isAgain ? 0.007 : Math.max(1, baseDays * (ratingId === 'hard' ? 1.2 : ratingId === 'good' ? c.ease : c.ease * 1.3))
          return {
            ...c,
            interval: nextDays,
            ease: Math.max(1.3, Math.min(3.2, c.ease + r.ease)),
            reps: c.reps + 1,
            lapses: c.lapses + (isAgain ? 1 : 0),
            dueAt: Date.now() + nextDays * DAY,
            lastRating: ratingId,
          }
        }),
      )
      setRatings((prev) => [...prev, ratingId])
      setFlipped(false)
      if (autoSpeak && voiceOn) {
        /* reading the next card is handled below */
      }
      setPos((p) => p + 1)
    },
    [current, autoSpeak, voiceOn],
  )

  /* keyboard shortcuts while the flashcards tab is active */
  const { tab } = useApp()

  useEffect(() => {
    if (!flipped || !autoSpeak || !voiceOn || !current) return
    speakOnce(current.back)
  }, [flipped, autoSpeak, voiceOn, current])

  useEffect(() => {
    if (tab !== 'flashcards') return
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (queueDone) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        rate(RATINGS[Number(e.key) - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab, flipped, rate, queueDone])

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Load a session to generate a flashcard deck.</p>
        <Button className="mx-auto mt-4" variant="primary" onClick={() => setTab('voice')}>
          Open AI Solver
        </Button>
      </Card>
    )
  }

  const regenerate = (withDerived = true) => {
    const d = buildDeck(withDerived)
    setDeck(d)
    setQueue(shuffle(d.map((c) => c.id)))
    setPos(0)
    setFlipped(false)
    setRatings([])
    pushToast({
      title: 'Deck generated',
      body: `${d.length} cards · ${withDerived ? 'including derived formula cards' : 'curated core cards'} for ${session.disciplineMeta?.short}.`,
      tone: 'violet',
      kind: 'success',
    })
  }

  const reshuffle = () => {
    setQueue(shuffle(deck.map((c) => c.id)))
    setPos(0)
    setFlipped(false)
    setRatings([])
  }

  const jumpTo = (cardId) => {
    const idx = queue.indexOf(cardId)
    setQueue((q) => (idx >= 0 ? q : [cardId, ...q]))
    setPos(idx >= 0 ? idx : 0)
    setFlipped(false)
  }

  const filtered = deck.filter((c) => {
    if (filter === 'due') return c.dueAt <= Date.now()
    if (filter === 'mastered') return c.interval >= 21
    if (filter === 'learning') return c.reps > 0 && c.interval < 21
    if (filter === 'new') return c.reps === 0
    return true
  })

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Layers}
        tone="violet"
        eyebrow="Long-term memory"
        title="Spaced-Repetition Flashcards"
        sub="The deck is generated from the current topic and scheduled with a SM-2 style algorithm. Rate honestly — the interval decides when the card returns."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="violet" icon={Sparkles}>
              {deck.length} cards
            </Badge>
            <Button size="sm" variant="outline" icon={Shuffle} onClick={reshuffle}>
              Shuffle
            </Button>
            <Button size="sm" variant="primary" icon={Sparkles} onClick={() => regenerate(true)}>
              Generate deck
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        {/* study area */}
        <div className="min-w-0 space-y-3">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-violet" />
                <p className="label text-violet">Study session</p>
                <span className="font-mono text-[10px] text-slate-500">
                  {Math.min(pos + (queueDone ? 0 : 1), queue.length)} / {queue.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={queueDone ? 'emerald' : 'slate'} dot>
                  {queueDone ? 'queue complete' : `${dueCount} due`}
                </Badge>
                <span className="hidden font-mono text-[9.5px] uppercase tracking-wider text-slate-600 sm:inline">
                  space flip · 1–4 rate
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {queueDone ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center animate-slide-up">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald/30 bg-emerald/10 text-emerald shadow-[0_0_50px_-16px_rgba(16,185,129,.8)]">
                    <Trophy size={28} />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-white">Queue cleared.</h3>
                  <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-slate-400">
                    You reviewed {reviewed} cards with {accuracy}% recall. Cards you rated “Again” will return first —
                    that is the algorithm doing its job.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {RATINGS.map((r) => {
                      const count = ratings.filter((x) => x === r.id).length
                      return (
                        <div key={r.id} className={`rounded-lg border px-2.5 py-1.5 ${accent(r.tone).border} ${accent(r.tone).bg}`}>
                          <p className={`font-mono text-[13px] font-semibold ${accent(r.tone).text}`}>{count}</p>
                          <p className="font-mono text-[8.5px] uppercase tracking-wider text-slate-500">{r.label}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button variant="primary" icon={RotateCcw} onClick={reshuffle}>
                      Study again
                    </Button>
                    <Button variant="outline" icon={Sparkles} onClick={() => regenerate(true)}>
                      New deck
                    </Button>
                  </div>
                </div>
              ) : current ? (
                <div className="animate-fade-in">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider ${accent(TAG_TONE[current.tag] || 'slate').border} ${accent(TAG_TONE[current.tag] || 'slate').text}`}>
                        {current.tag}
                      </span>
                      <span className="font-mono text-[9.5px] text-slate-500">
                        reps {current.reps} · interval {current.interval < 1 ? '10 min' : `${Math.round(current.interval)} d`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Toggle checked={autoSpeak} onChange={setAutoSpeak} label="Auto-read" tone="violet" />
                    </div>
                  </div>

                  <div className="flip-scene">
                    <button
                      onClick={() => setFlipped((f) => !f)}
                      className="block h-[340px] w-full text-left sm:h-[360px]"
                      aria-label={flipped ? 'Show question' : 'Reveal answer'}
                    >
                      <div className={`flip-inner h-full ${flipped ? 'flipped' : ''}`}>
                        {/* front */}
                        <div className="flip-face absolute inset-0 overflow-hidden rounded-2xl border border-violet/25 bg-gradient-to-br from-[#141a2e] via-[#0f172a] to-[#0b1120] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,.9)]">
                          <div className="grid-paper pointer-events-none absolute inset-0 opacity-25" />
                          <div className="relative flex h-full flex-col">
                            <div className="flex items-center justify-between">
                              <span className="label text-violet">Prompt</span>
                              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-600">card {pos + 1}</span>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-2">
                              <p className="text-center font-medium leading-snug text-white" style={{ fontSize: current.front.length > 60 ? '19px' : current.front.length > 25 ? '26px' : '34px' }}>
                                {current.front}
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500">
                              <RefreshCw size={11} /> tap to reveal
                            </div>
                          </div>
                        </div>
                        {/* back */}
                        <div className="flip-face flip-back absolute inset-0 overflow-hidden rounded-2xl border border-emerald/30 bg-gradient-to-br from-[#0d2a24] via-[#0f172a] to-[#0b1120] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,.9)]">
                          <div className="grid-paper pointer-events-none absolute inset-0 opacity-20" />
                          <div className="relative flex h-full flex-col">
                            <div className="flex items-center justify-between">
                              <span className="label text-emerald">Answer</span>
                              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-600">card {pos + 1}</span>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-1">
                              <p className={`text-center font-medium leading-snug ${/[=∑∫λ√^]|\d/.test(current.back) ? 'font-mono text-emerald' : 'text-white'}`} style={{ fontSize: current.back.length > 90 ? '16px' : current.back.length > 40 ? '20px' : '27px' }}>
                                {current.back}
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500">
                              <Check size={11} /> how well did you recall it?
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {flipped ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {RATINGS.map((r, i) => {
                        const a = accent(r.tone)
                        return (
                          <button
                            key={r.id}
                            onClick={() => rate(r.id)}
                            className={`group rounded-xl border ${a.border} ${a.bg} px-2 py-2.5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={`font-mono text-[9px] ${a.text} opacity-60`}>{i + 1}</span>
                              <span className={`text-[12px] font-semibold ${a.text}`}>{r.label}</span>
                            </div>
                            <p className="mt-0.5 font-mono text-[9px] text-slate-500">{r.hint}</p>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button variant="primary" icon={Check} onClick={() => setFlipped(true)}>
                        Reveal answer
                      </Button>
                      <p className="text-[11px] text-slate-500">Say the answer out loud before flipping — retrieval is the point.</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Button size="xs" variant="ghost" icon={ChevronLeft} onClick={() => { setPos((p) => Math.max(0, p - 1)); setFlipped(false) }} disabled={pos === 0}>
                        Prev
                      </Button>
                      <Button size="xs" variant="ghost" iconRight={ChevronRight} onClick={() => { setPos((p) => Math.min(queue.length, p + 1)); setFlipped(false) }}>
                        Skip
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={queue.length ? reviewed / queue.length : 0} tone="violet" className="w-24" height="h-1" />
                      <span className="font-mono text-[9.5px] text-slate-500">{reviewed} rated</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* deck browser */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-cyan" />
                <p className="label text-cyan">Deck browser</p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'due', label: 'Due' },
                  { id: 'new', label: 'New' },
                  { id: 'learning', label: 'Learning' },
                  { id: 'mastered', label: 'Mastered' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-md border px-2 py-1 text-[10px] font-medium transition ${
                      filter === f.id
                        ? 'border-cyan/35 bg-cyan/10 text-cyan'
                        : 'border-white/10 bg-white/[0.02] text-slate-500 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {filtered.length === 0 && <p className="p-4 text-center text-[11.5px] text-slate-500">No cards in this filter.</p>}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => jumpTo(c.id)}
                  className="flex w-full items-center gap-2.5 border-b border-white/[0.04] px-4 py-2 text-left transition last:border-0 hover:bg-white/[0.035]"
                >
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${accent(TAG_TONE[c.tag] || 'slate').border} ${accent(TAG_TONE[c.tag] || 'slate').text}`}>
                    {c.tag}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-300">{c.front}</span>
                  <span className="hidden w-24 shrink-0 sm:block">
                    <Progress value={mastery(c) / 100} tone={c.interval >= 21 ? 'emerald' : 'violet'} height="h-1" />
                  </span>
                  <span className={`w-16 shrink-0 text-right font-mono text-[9.5px] ${c.dueAt <= Date.now() ? 'text-amber' : 'text-slate-500'}`}>
                    {fmtDue(c)}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* stats rail */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-emerald" />
                <p className="label text-emerald">Deck health</p>
              </div>
              <Badge tone="violet">{session.disciplineMeta?.short}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { k: 'Due now', v: dueCount, c: 'text-amber', icon: CalendarClock },
                { k: 'New', v: deck.filter((c) => c.reps === 0).length, c: 'text-cyan', icon: Sparkles },
                { k: 'Learning', v: learningCount, c: 'text-violet-soft', icon: Brain },
                { k: 'Mastered', v: masteredCount, c: 'text-emerald', icon: Trophy },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="label">{s.k}</p>
                    <s.icon size={11} className={s.c} />
                  </div>
                  <p className={`mt-1 font-mono text-lg font-semibold ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="label">Deck mastery</p>
                <span className="font-mono text-[10px] text-slate-400">{Math.round(totalProgress * 100)}%</span>
              </div>
              <Progress value={totalProgress} tone="emerald" className="mt-1.5" />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">session recall</span>
              <span className={`font-mono text-[12px] font-semibold ${accuracy >= 70 ? 'text-emerald' : 'text-amber'}`}>
                {reviewed ? `${accuracy}%` : '—'}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-cyan" />
              <p className="label text-cyan">Scheduling ladder</p>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {RATINGS.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${accent(r.tone).dot}`} />
                  <span className="text-[11px] text-slate-300">{r.label}</span>
                  <span className="ml-auto font-mono text-[10px] text-slate-500">{r.hint}</span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-slate-500">
              Intervals grow by the card’s ease factor, so well-known cards drift into the far future while shaky ones
              stay close. A card is considered mastered after 21 days.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-violet" />
                <p className="label">Session log</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{ratings.length} reviews</span>
            </div>
            <div className="mt-2 flex h-12 items-end gap-1">
              {ratings.length === 0 && <p className="text-[10.5px] text-slate-600">Rate cards to populate the log.</p>}
              {ratings.map((r, i) => (
                <span
                  key={i}
                  title={r}
                  className={`w-2.5 rounded-t ${accent(RATINGS.find((x) => x.id === r).tone).solid}`}
                  style={{ height: `${r === 'again' ? 22 : r === 'hard' ? 54 : r === 'good' ? 82 : 100}%`, opacity: 0.65 }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['again', 'hard', 'good', 'easy'].map((r) => (
                <span key={r} className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wider text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${accent(RATINGS.find((x) => x.id === r).tone).dot}`} />
                  {r}
                </span>
              ))}
            </div>
          </Card>

          <Card className="border-violet/20 bg-violet/[0.05] p-4">
            <div className="flex items-center gap-2">
              <Flame size={13} className="text-violet-soft" />
              <p className="label text-violet-soft">Retention tip</p>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
              Review right before you would forget. If “Good” feels too easy for three sessions in a row, the algorithm
              stretches the interval automatically.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button size="xs" variant="outline" icon={ArrowLeft} onClick={() => regenerate(false)}>
                Core deck
              </Button>
              <Button size="xs" variant="ghost" icon={ArrowRight} onClick={() => setVoiceOn(!voiceOn)}>
                {voiceOn ? 'Mute tutor' : 'Unmute tutor'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
