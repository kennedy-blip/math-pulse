import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Lightbulb,
  MapPin,
  MessagesSquare,
  Mic2,
  Mountain,
  Pause,
  PencilLine,
  Pizza,
  Play,
  Radio,
  Repeat,
  Route,
  ScanSearch,
  Sparkles,
  Square,
  Users,
  Volume2,
  VolumeX,
  Wand2,
  Waves,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { on } from '../lib/bus.js'
import { useNarration, splitWords, speakOnce } from '../hooks/useNarration.js'
import { DISCIPLINES } from '../data/problems.js'
import { AutoDiagramInline } from './AutoDiagram.jsx'
import ProblemComposer from './ProblemComposer.jsx'
import {
  Badge,
  Button,
  Card,
  Formula,
  IconButton,
  Progress,
  SectionHeader,
  Toggle,
  accent,
} from './ui.jsx'

const ANALOGY_ICONS = { Car, Gauge, Mountain, Route, Users, Pizza }

const SPEEDS = [0.75, 1, 1.25, 1.5]
const fmtTime = (s) => {
  const total = Math.max(0, Math.round(s))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function Waveform({ playing, tone = '#8b5cf6', bars = 30 }) {
  return (
    <div className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const base = 18 + Math.abs(Math.sin(i * 1.7)) * 60
        return (
          <span
            key={i}
            className="w-[3px] shrink-0 rounded-full transition-all duration-300"
            style={{
              height: playing ? `${base}%` : `${Math.max(10, base * 0.35)}%`,
              backgroundColor: playing ? tone : 'rgba(148,163,184,.25)',
              animationName: playing ? 'float' : 'none',
              animationDuration: `${0.8 + (i % 7) * 0.13}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${i * 22}ms`,
              opacity: playing ? 0.55 + (i % 5) * 0.09 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

function Karaoke({ words, wordIndex, onWordClick, active }) {
  const boxRef = useRef(null)
  const wordRefs = useRef([])

  useEffect(() => {
    const el = wordRefs.current[wordIndex]
    const box = boxRef.current
    if (!el || !box || !active) return
    const top = el.offsetTop
    if (top - box.scrollTop > box.clientHeight - 90 || top < box.scrollTop) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 2), behavior: 'smooth' })
    }
  }, [wordIndex, active])

  return (
    <div
      ref={boxRef}
      className="relative max-h-[40vh] overflow-y-auto pr-2 sm:max-h-[236px] text-[15.5px] leading-[2.05] tracking-[-0.005em] sm:text-[16.5px] sm:leading-[2.1]"
    >
      <p className="m-0">
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
          <button
            ref={(el) => {
              wordRefs.current[i] = el
            }}
            onClick={() => onWordClick?.(i)}
            className={`karaoke-word inline rounded px-[1px] text-left ${
              i === wordIndex && active
                ? 'karaoke-active'
                : i < wordIndex
                  ? 'karaoke-done'
                  : 'karaoke-pending'
            }`}
            title={active ? `Jump to “${w}”` : undefined}
          >
            {w}
          </button>
          {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </p>
    </div>
  )
}

function TopicDetector({ session }) {
  const meta = session.disciplineMeta || DISCIPLINES[session.discipline]
  const a = accent(meta?.accent || 'violet')
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanSearch size={14} className={a.text} />
          <p className="label">Topic auto-detector</p>
        </div>
        <Badge tone={meta?.accent || 'violet'}>{session.confidence}%</Badge>
      </div>
      <p className="mt-2.5 text-sm font-semibold text-white">{meta?.name}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{meta?.blurb}</p>
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${a.solid}`} style={{ width: `${session.confidence}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(session.detected?.signals || session.tags || []).slice(0, 4).map((s) => (
          <span key={s} className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] text-slate-400">
            {s}
          </span>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-slate-600">
        {session.generated ? 'adaptive skeleton · nearest authored exemplar' : 'matched authored solution graph'}
      </p>
    </Card>
  )
}

export default function VoiceTutor() {
  const app = useApp()
  const { session, setTab, voiceOn, setVoiceOn, setCoreState, pushToast, newSession } = app
  const [rate, setRate] = useState(1)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [showComposer, setShowComposer] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const steps = session?.steps || []
  const narration = useNarration({ steps, voiceOn, rate, autoAdvance })
  const { status, activeIndex, wordIndex, progress, words, voices, voiceURI, setVoiceURI, supported, speechReady } = narration

  /* report status to the header */
  useEffect(() => {
    if (!session) return
    if (!voiceOn) setCoreState('muted')
    else if (status === 'playing') setCoreState('speaking')
    else setCoreState('listening')
  }, [status, voiceOn, setCoreState, session])

  useEffect(() => {
    const off1 = on('pause-narration', () => narration.pause())
    const off2 = on('stop-narration', () => narration.stop())
    return () => {
      off1()
      off2()
    }
  }, [narration.pause, narration.stop])

  useEffect(() => {
    setShowComposer(false)
    setExpanded(null)
  }, [session?.id])

  const current = useMemo(() => {
    if (!steps.length) return null
    return steps[activeIndex >= 0 ? activeIndex : 0]
  }, [steps, activeIndex])

  const displayWords = useMemo(() => {
    if (words.length) return words
    return splitWords(current?.narration || '')
  }, [words, current])

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <ProblemComposer hero />
          <div className="space-y-3">
            <Card className="relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-transparent to-cyan/10" />
              <div className="relative">
                <Badge tone="emerald" pulse dot>
                  AI Tutor Core: Active
                </Badge>
                <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white">
                  Every equation, narrated like a human tutor.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  Step-by-step audio explanations mapped to real-world situations, with karaoke-synced highlighting,
                  Socratic questioning, and diagrams that appear on their own.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { icon: Mic2, label: 'Realistic voice', tone: 'violet' },
                    { icon: MessagesSquare, label: 'Socratic dialogue', tone: 'amber' },
                    { icon: PencilLine, label: 'Handwritten proofs', tone: 'cyan' },
                    { icon: Repeat, label: 'Spaced repetition', tone: 'emerald' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2">
                      <f.icon size={14} className={accent(f.tone).text} />
                      <span className="text-[11.5px] text-slate-300">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <p className="label text-amber">How a session unfolds</p>
              <ol className="mt-2 space-y-2">
                {[
                  'You ask in text or by voice — the topic detector classifies the discipline.',
                  'The tutor narrates each step with an analogy; the transcript highlights as it speaks.',
                  'A diagram is synthesized automatically to anchor the intuition.',
                  'Finish with summary notes, an adaptive quiz and a spaced-repetition deck.',
                ].map((t, i) => (
                  <li key={t} className="flex gap-2.5 text-[12px] leading-relaxed text-slate-400">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[9.5px] text-slate-400">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const a = accent(session.disciplineMeta?.accent || 'violet')
  const AnalogyIcon = ANALOGY_ICONS[session.analogy?.icon] || Sparkles
  const totalSeconds = displayWords.length / (2.65 * rate)
  const elapsed = totalSeconds * progress
  const activeStep = activeIndex >= 0 ? activeIndex : 0

  const handlePlay = () => {
    if (!voiceOn) {
      setVoiceOn(true)
      pushToast({
        title: 'Voice tutor unmuted',
        body: 'Narration resumes with your saved position.',
        tone: 'violet',
        kind: 'info',
      })
      setTimeout(() => narration.playStep(activeIndex >= 0 ? activeIndex : 0, 0), 80)
      return
    }
    narration.toggle()
  }

  const selectStep = (i) => {
    if (!voiceOn) {
      setVoiceOn(true)
      pushToast({ title: 'Voice tutor unmuted', tone: 'violet', kind: 'info' })
    }
    setTimeout(() => narration.playStep(i, 0), 60)
  }

  return (
    <div className="space-y-5">
      {/* problem banner */}
      <Card className="relative overflow-hidden p-0">
        <div className={`absolute inset-0 bg-gradient-to-r ${a.grad} opacity-70`} />
        <div className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={session.disciplineMeta?.accent || 'violet'} icon={ScanSearch}>
                {session.disciplineMeta?.short}
              </Badge>
              <Badge tone="slate" icon={Clock}>
                {session.minutes} min read
              </Badge>
              <Badge tone={session.difficulty === 'Advanced' ? 'rose' : 'emerald'} dot>
                {session.difficulty}
              </Badge>
              {session.generated && <Badge tone="amber" icon={Wand2}>adaptive lesson</Badge>}
            </div>
            <h1 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
              {session.title}
            </h1>
            <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-400">{session.prompt}</p>
            <Formula tone={session.disciplineMeta?.accent || 'violet'} block className="mt-2 text-[12.5px] text-slate-300">
              {session.formula}
            </Formula>
            {session.sourceImage && (
              <div className="mt-3 flex max-w-md items-center gap-2.5 rounded-xl border border-cyan/25 bg-cyan/[0.06] p-1.5 pr-3">
                <img
                  src={session.sourceImage}
                  alt="Cropped question imported from an image"
                  className="h-10 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan">Question from image</p>
                  <p className="truncate text-[11px] text-slate-400">Cropped &amp; read on-device with OCR</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:flex-col lg:items-stretch">
            <Button size="sm" variant="outline" icon={PencilLine} onClick={() => setShowComposer((s) => !s)}>
              {showComposer ? 'Hide composer' : 'New problem'}
            </Button>
            <Button size="sm" variant="outline" icon={MessagesSquare} onClick={() => setTab('socratic')} className="border-amber/30 text-amber hover:bg-amber/10">
              Socratic mode
            </Button>
            <Button size="sm" variant="ghost" icon={Square} onClick={newSession}>
              Reset session
            </Button>
          </div>
        </div>
      </Card>

      {showComposer && <ProblemComposer onSolved={() => setShowComposer(false)} />}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.62fr)_minmax(300px,1fr)]">
        {/* ---------------- left column ---------------- */}
        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-violet/30 bg-violet/[0.12] text-violet-soft">
                  <AudioLines size={15} />
                  {status === 'playing' && <span className="absolute inset-0 animate-pulse-ring rounded-lg border border-violet/40" />}
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-white">AI Voice Tutor</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {session.disciplineMeta?.short} · human-like reasoning
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge tone={status === 'playing' ? 'cyan' : 'emerald'} pulse={status === 'playing'} dot>
                  {status === 'playing' ? 'narrating' : status === 'paused' ? 'paused' : 'ready'}
                </Badge>
                <Badge tone={voiceOn ? 'violet' : 'slate'} icon={voiceOn ? Volume2 : VolumeX}>
                  {voiceOn ? 'voice on' : 'muted'}
                </Badge>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`label ${a.text}`}>{current?.eyebrow || `Step ${activeStep + 1}`}</p>
                  <h3 className="mt-1 text-[15px] font-semibold leading-snug text-white sm:text-base">{current?.title}</h3>
                </div>
                <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10.5px] text-slate-400">
                  {activeStep + 1} / {steps.length}
                </span>
              </div>

              <div className={`mt-2.5 inline-block max-w-full rounded-lg border ${a.border} ${a.bg} px-2.5 py-1.5`}>
                <Formula size="sm" tone={session.disciplineMeta?.accent || 'violet'} className="break-words text-white">
                  {current?.formula}
                </Formula>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-obsidian/50 p-3.5 sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Waves size={12} className={a.text} />
                    <span className="label">Karaoke transcript</span>
                  </div>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-600">
                    click a word to replay
                  </span>
                </div>
                <Karaoke
                  words={displayWords}
                  wordIndex={wordIndex}
                  onWordClick={(w) => {
                    if (!voiceOn) setVoiceOn(true)
                    narration.replayWord(w)
                  }}
                  active={status === 'playing' || status === 'paused'}
                />
                <div className="mt-2 flex justify-end gap-1">
                  <button
                    onClick={() => {
                      if (voiceOn) speakOnce(current?.narration || '')
                      else pushToast({ title: 'Voice is muted', body: 'Turn the voice tutor on to hear steps.', tone: 'amber', kind: 'info' })
                    }}
                    className="flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-slate-500 transition hover:bg-white/5 hover:text-white"
                  >
                    <Volume2 size={11} /> read step
                  </button>
                </div>
              </div>

              {/* transport */}
              <div className="mt-4 flex items-center gap-2.5">
                <IconButton icon={ChevronLeft} label="Previous step" size={9} onClick={narration.prev} />
                <button
                  onClick={handlePlay}
                  aria-label={status === 'playing' ? 'Pause narration' : 'Play narration'}
                  className={`group relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-white transition-all active:scale-95 ${
                    voiceOn
                      ? 'bg-gradient-to-br from-violet to-violet/70 shadow-[0_0_34px_-6px_rgba(139,92,246,.95)] hover:shadow-[0_0_44px_-4px_rgba(139,92,246,1)]'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {status === 'playing' ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" className="ml-0.5" />}
                  {status === 'playing' && <span className="absolute inset-0 animate-pulse-ring rounded-full border border-violet/50" />}
                </button>
                <IconButton icon={ChevronRight} label="Next step" size={9} onClick={narration.next} />
                <div className="min-w-0 flex-1">
                  <Waveform playing={status === 'playing'} tone={a.hex} bars={34} />
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={progress} tone={session.disciplineMeta?.accent || 'violet'} height="h-1" />
                    <span className="shrink-0 font-mono text-[9.5px] text-slate-500">
                      {fmtTime(elapsed)} / {fmtTime(totalSeconds + 0.45)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => narration.stop()}
                  aria-label="Stop narration"
                  title="Stop and reset the player"
                  className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white sm:grid"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              </div>

              {/* settings row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/[0.06] pt-3">
                <div className="flex items-center gap-1">
                  <span className="mr-1 font-mono text-[9.5px] uppercase tracking-wider text-slate-500">rate</span>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setRate(s)}
                      className={`rounded-md border px-1.5 py-1 font-mono text-[10px] transition ${
                        rate === s
                          ? 'border-violet/40 bg-violet/15 text-violet-soft'
                          : 'border-white/10 bg-white/[0.02] text-slate-500 hover:text-white'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">voice</span>
                  <select
                    value={voiceURI}
                    onChange={(e) => setVoiceURI(e.target.value)}
                    className="max-w-[150px] rounded-md border border-white/10 bg-[#0b1120] px-2 py-1 text-[11px] text-slate-300 focus:border-violet/40 focus:outline-none"
                    aria-label="Narration voice"
                  >
                    {!voices.length && <option value="">System default</option>}
                    {voices
                      .filter((v) => (v.lang || '').toLowerCase().startsWith('en'))
                      .slice(0, 30)
                      .map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name.replace(/Microsoft |Online \(Natural\)/g, '').trim().slice(0, 30)}
                        </option>
                      ))}
                  </select>
                </div>

                <Toggle checked={autoAdvance} onChange={setAutoAdvance} label="Auto-advance" tone="cyan" />
                <Toggle
                  checked={voiceOn}
                  onChange={(v) => {
                    setVoiceOn(v)
                    if (!v) narration.pause()
                  }}
                  label="Voice"
                  tone="violet"
                />
                <button
                  onClick={() => {
                    setTab('socratic')
                    narration.pause()
                  }}
                  className="ml-auto flex items-center gap-1.5 rounded-lg border border-amber/25 bg-amber/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-amber transition hover:bg-amber/15"
                >
                  <MessagesSquare size={12} /> Teach me Socratically
                </button>
              </div>

              {supported && speechReady === 'none' && (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[10.5px] leading-relaxed text-slate-400">
                  <VolumeX size={12} className="mt-0.5 shrink-0" />
                  No system voices were found in this browser, so narration runs as silent karaoke with full
                  highlighting. The transcript, steps and diagrams stay in sync.
                </p>
              )}
              {!supported && (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber/20 bg-amber/[0.06] p-2 text-[10.5px] leading-relaxed text-amber/90">
                  <VolumeX size={12} className="mt-0.5 shrink-0" />
                  This browser has no speech-synthesis engine. Karaoke still runs silently so every step stays synced —
                  try Chrome or Edge for audio.
                </p>
              )}
              {supported && !speechReady && (
                <p className="mt-3 font-mono text-[10px] text-slate-600">Loading system voices…</p>
              )}
            </div>
          </Card>

          {/* insight strip */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-cyan/15 bg-cyan/[0.04] p-3.5">
              <div className="flex items-center gap-2">
                <Lightbulb size={13} className="text-cyan" />
                <p className="label text-cyan">Why it works</p>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">{current?.insight}</p>
            </Card>
            <Card className="border-amber/15 bg-amber/[0.04] p-3.5">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-amber" />
                <p className="label text-amber">Real-world mapping</p>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">{current?.analogy}</p>
            </Card>
          </div>

          {/* step timeline */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-violet" />
                <p className="label">Reasoning timeline</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{steps.length} narrated steps</span>
            </div>
            <ol className="relative p-3">
              <span className="absolute bottom-6 left-[26px] top-6 w-px bg-gradient-to-b from-violet/40 via-white/10 to-transparent" aria-hidden />
              {steps.map((s, i) => {
                const active = activeStep === i
                const done = status === 'idle' && activeIndex > i
                const playing = active && status === 'playing'
                return (
                  <li key={s.id} className="relative">
                    <button
                      onClick={() => selectStep(i)}
                      className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? 'border-white/[0.12] bg-white/[0.05]'
                          : 'border-transparent hover:border-white/[0.07] hover:bg-white/[0.025]'
                      }`}
                    >
                      <span
                        className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition ${
                          active
                            ? `${accent(s.accent || 'violet').border} ${accent(s.accent || 'violet').bg} ${accent(s.accent || 'violet').text}`
                            : 'border-white/15 bg-[#0b1120] text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        {playing ? (
                          <span className="flex items-end gap-[2px]">
                            <span className="h-2 w-[2px] animate-pulse rounded-full bg-current" />
                            <span className="h-3 w-[2px] animate-pulse rounded-full bg-current" style={{ animationDelay: '120ms' }} />
                            <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-current" style={{ animationDelay: '240ms' }} />
                          </span>
                        ) : done ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`text-[12.5px] font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{s.title}</span>
                          <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-px font-mono text-[9px] text-slate-500">
                            {fmtTime(splitWords(s.narration).length / (2.65 * rate))}
                          </span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block font-mono text-[10.5px] text-slate-500">{s.formula}</span>
                        {expanded === i && (
                          <span className="mt-2 block space-y-2 border-t border-white/[0.06] pt-2 text-[11.5px] leading-relaxed text-slate-400">
                            <span className="block">{s.insight}</span>
                            <span className="block rounded-lg border border-amber/15 bg-amber/[0.05] p-2 text-slate-300">
                              <span className="mr-1 font-mono text-[9px] uppercase tracking-wider text-amber">analogy</span>
                              {s.analogy}
                            </span>
                            {s.diagramNote && (
                              <span className="block rounded-lg border border-cyan/15 bg-cyan/[0.05] p-2 text-[11px] text-cyan/90">
                                <Wand2 size={10} className="mr-1 inline" /> {s.diagramNote}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpanded(expanded === i ? null : i)
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setExpanded(expanded === i ? null : i)}
                          className="rounded-md px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-slate-500 transition hover:bg-white/10 hover:text-white"
                        >
                          {expanded === i ? 'less' : 'more'}
                        </span>
                        <ArrowRight size={13} className={active ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>

        {/* ---------------- right column ---------------- */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-amber/20 p-0">
            <div className="flex items-center justify-between border-b border-amber/15 bg-amber/[0.07] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <AnalogyIcon size={14} className="text-amber" />
                <p className="label text-amber">Real-world analogy</p>
              </div>
              <button
                onClick={() => {
                  if (!voiceOn) setVoiceOn(true)
                  speakOnce(`${session.analogy.title}. ${session.analogy.body}`)
                }}
                className="rounded-md p-1 text-amber/70 transition hover:bg-amber/10 hover:text-amber"
                title="Read the analogy aloud"
                aria-label="Read the analogy aloud"
              >
                <Volume2 size={13} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[13.5px] font-semibold text-amber">{session.analogy.title}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">{session.analogy.body}</p>
              <div className="mt-3 space-y-1">
                {steps.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-start gap-2 text-[11px] leading-snug text-slate-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/60" />
                    <span className="line-clamp-2">{s.analogy}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Wand2 size={13} className="text-cyan" />
                <p className="label text-cyan">Auto-diagram</p>
              </div>
              <Badge tone="emerald" pulse dot>
                synthesized
              </Badge>
            </div>
            <div className="p-3">
              <AutoDiagramInline kind={session.diagram?.kind} compact />
              <div className="mt-2 px-1">
                <p className="font-mono text-[10px] text-slate-500">{session.diagram?.title}</p>
                <button
                  onClick={() => {
                    narration.pause()
                    setTab('diagram')
                  }}
                  className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-cyan/20 bg-cyan/[0.05] px-2.5 py-1.5 text-[11px] font-semibold text-cyan transition hover:bg-cyan/10"
                >
                  Open Auto-Diagram Studio
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </Card>

          <TopicDetector session={session} />

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Radio size={13} className="text-violet" />
              <p className="label">Answer preview</p>
            </div>
            <p className="mt-2 break-words font-mono text-[13px] font-semibold text-emerald">{session.answer}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{session.answerNote}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(session.tags || []).map((t) => (
                <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" icon={PencilLine} onClick={() => { narration.pause(); setTab('handwriting') }}>
                Handwritten
              </Button>
              <Button size="sm" variant="outline" icon={Repeat} onClick={() => { narration.pause(); setTab('flashcards') }}>
                Make cards
              </Button>
            </div>
          </Card>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-violet" />
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">Tutor note</p>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
              Don’t just read the steps — tap a step, pause after each, and try to predict the next move before the
              voice continues. Retrieval beats re-reading.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
