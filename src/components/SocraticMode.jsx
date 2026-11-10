import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Brain,
  Check,
  CircleHelp,
  Compass,
  CornerDownLeft,
  Eye,
  EyeOff,
  Gauge,
  GraduationCap,
  Lightbulb,
  Lock,
  MessagesSquare,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { buildSocraticFor } from '../data/socratic.js'
import { speakOnce } from '../hooks/useNarration.js'
import { ACCENTS, Badge, Button, Card, Formula, Progress, SectionHeader, Toggle, accent } from './ui.jsx'

const STOP = new Set([
  'the', 'and', 'then', 'that', 'this', 'with', 'into', 'from', 'your', 'have', 'will',
  'what', 'when', 'which', 'because', 'about', 'them', 'they', 'there', 'here', 'give',
  'giving', 'gives', 'should', 'would', 'could', 'move', 'next', 'step', 'look',
])

export default function SocraticMode() {
  const { session, setTab, voiceOn, setVoiceOn, pushToast, newSession } = useApp()
  const [enabled, setEnabled] = useState(true)
  const [messages, setMessages] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintOpen, setHintOpen] = useState(false)
  const [wrong, setWrong] = useState({})
  const [completed, setCompleted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [input, setInput] = useState('')
  const timers = useRef([])
  const scrollRef = useRef(null)
  const nextId = useRef(0)

  const exchanges = useMemo(() => (session ? buildSocraticFor(session) : []), [session])
  const exchange = exchanges[stepIndex]
  const meta = session?.disciplineMeta
  const a = accent(meta?.accent || 'violet')

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const pushAi = (text, extra = {}) => {
    setMessages((m) => [...m, { id: `ai-${nextId.current++}`, role: 'ai', text, ...extra }])
  }

  /* reset on new session */
  useEffect(() => {
    clearTimers()
    setMessages([])
    setStepIndex(0)
    setSolved(0)
    setAttempts(0)
    setHintsUsed(0)
    setHintOpen(false)
    setWrong({})
    setCompleted(false)
    setThinking(false)
    setInput('')
    if (!session || !exchanges.length) return
    setMessages([
      {
        id: 'greet',
        role: 'ai',
        text: `Let’s discover “${session.title}” together. I won’t hand you the answer — I’ll ask you the questions a good tutor would. There are no penalties here, only better reasoning. Ready?`,
      },
    ])
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking, hintOpen, stepIndex])

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Start a session to enter Socratic mode.</p>
        <Button className="mx-auto mt-4" variant="primary" onClick={() => setTab('voice')}>
          Open AI Solver
        </Button>
      </Card>
    )
  }

  const nudge = (text) => {
    pushAi(text, { kind: 'nudge' })
    if (voiceOn) speakOnce(text)
  }

  const read = (text) => {
    if (!voiceOn) {
      pushToast({ title: 'Voice is muted', body: 'Enable the voice tutor to hear replies.', tone: 'amber', kind: 'info' })
      return
    }
    speakOnce(text)
  }

  const finishExchange = (option, synthetic = false) => {
    setSolved((s) => s + 1)
    pushAi(option.feedback)
    if (voiceOn) speakOnce(option.feedback)
    setThinking(true)
    const nextIndex = stepIndex + 1
    const t = setTimeout(() => {
      setThinking(false)
      if (nextIndex < exchanges.length) {
        setStepIndex(nextIndex)
        setHintOpen(false)
        if (voiceOn) speakOnce(exchanges[nextIndex].question)
      } else {
        setCompleted(true)
        const close = `That’s the whole argument, built by you. The result is ${session.answer}. Notice how each question was doing one small job — that’s how experts actually think. Want to test it under exam pressure?`
        pushAi(close, { kind: 'complete' })
        if (voiceOn) speakOnce(close)
      }
    }, synthetic ? 550 : 900)
    timers.current.push(t)
  }

  const choose = (option, idx) => {
    if (thinking || completed) return
    setMessages((m) => [...m, { id: `u-${nextId.current++}`, role: 'user', text: option.text }])
    if (option.correct) {
      finishExchange(option)
      return
    }
    setAttempts((n) => n + 1)
    setWrong((w) => ({ ...w, [stepIndex]: new Set([...(w[stepIndex] || []), idx]) }))
    nudge(option.feedback)
  }

  const submitFree = () => {
    const answer = input.trim()
    if (!answer || thinking || completed || !exchange) return
    setMessages((m) => [...m, { id: `u-${nextId.current++}`, role: 'user', text: answer }])
    setInput('')
    const correct = exchange.options.find((o) => o.correct)
    const key = correct.text.toLowerCase()
    const tokens = key
      .replace(/[^a-z0-9\s.+\-−/]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
    const low = answer.toLowerCase()
    const numbers = (key.match(/\d+(\.\d+)?/g) || []).filter((n) => low.includes(n))
    const hits = tokens.filter((t) => low.includes(t))
    const strong = hits.filter((h) => /deriv|slope|tangent|gradient|lambda|λ|substitut|power|area|integral|antideriv|bound|sum|ratio|scale|angle|scalene|acute|normal|z-?score|complement|probab|constraint|intersect|line|eliminat|matrix|determinant|bell|tail|mean/.test(h))
    if (strong.length >= 1 || numbers.length >= 1 || hits.length >= 3) {
      pushAi('That’s the reasoning I was looking for — let me confirm it.', { kind: 'correct' })
      finishExchange(correct, true)
    } else {
      setAttempts((n) => n + 1)
      nudge(
        `I can’t verify that yet. Try naming the mathematical move explicitly — for example, “${exchange.options
          .find((o) => o.correct)
          .text.toLowerCase()}” in your own words. Or choose one of the options below.`,
      )
    }
  }

  const revealHint = () => {
    if (hintOpen) {
      setHintOpen(false)
      return
    }
    setHintOpen(true)
    setHintsUsed((h) => h + 1)
  }

  const revealSolution = () => {
    clearTimers()
    setThinking(false)
    setCompleted(true)
    pushAi(
      `Alright — here is the full argument. ${session.steps
        .map((s, i) => `${i + 1}. ${s.title}: ${s.formula}`)
        .join(' ')} Final result: ${session.answer}.`,
      { kind: 'reveal' },
    )
    pushToast({ title: 'Solution revealed', body: 'Try the quiz to consolidate it.', tone: 'amber', kind: 'info' })
  }

  const reset = () => {
    clearTimers()
    setMessages([])
    setStepIndex(0)
    setSolved(0)
    setAttempts(0)
    setHintsUsed(0)
    setWrong({})
    setCompleted(false)
    setHintOpen(false)
    setThinking(false)
    setMessages([
      {
        id: 'greet-2',
        role: 'ai',
        text: `Fresh start. Let’s reason through “${session.title}” one question at a time.`,
      },
    ])
  }

  const accuracy = attempts + solved > 0 ? Math.round((solved / (solved + attempts)) * 100) : 100

  /* ---------------- direct mode ---------------- */
  if (!enabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          icon={MessagesSquare}
          tone="amber"
          eyebrow="Instructional mode"
          title="Socratic Mode"
          sub="Guided discovery is paused. You are now seeing the tutor’s direct explanation."
          right={
            <Toggle checked={enabled} onChange={setEnabled} label="Socratic guidance" tone="amber" hint="Ask me questions instead of telling me" />
          }
        />
        <Card className="border-amber/20 p-5">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber" />
            <p className="label text-amber">Direct explanation</p>
          </div>
          <h2 className="mt-1.5 text-lg font-semibold text-white">{session.title}</h2>
          <Formula block tone="amber" className="mt-1 text-slate-300">
            {session.formula}
          </Formula>
          <ol className="mt-4 space-y-3">
            {session.steps.map((s, i) => (
              <li key={s.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-amber/10 font-mono text-[10px] text-amber">
                    {i + 1}
                  </span>
                  <p className="text-[13px] font-semibold text-white">{s.title}</p>
                </div>
                <p className="mt-1.5 font-mono text-[11.5px] text-slate-300">{s.formula}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{s.narration}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg border border-emerald/20 bg-emerald/[0.06] p-3 font-mono text-[13px] text-emerald">
            {session.answer}
          </p>
          <Button className="mt-4" variant="outline" icon={MessagesSquare} tone="amber" onClick={() => setEnabled(true)}>
            Return to guided discovery
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={MessagesSquare}
        tone="amber"
        eyebrow="Guided discovery engine"
        title="Socratic Mode"
        sub="The tutor withholds the answer and asks the next best question. Your reasoning drives the dialogue."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber" icon={Brain} pulse={!completed}>
              {completed ? 'dialogue complete' : 'discovery in progress'}
            </Badge>
            <Toggle checked={enabled} onChange={setEnabled} label="Socratic" tone="amber" />
          </div>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.62fr)_minmax(300px,1fr)]">
        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden p-0 lg:min-h-[600px]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-gradient-to-r from-amber/[0.09] to-transparent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-amber/30 bg-amber/[0.12] text-amber">
                <GraduationCap size={15} />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-obsidian bg-emerald" />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-white">Socratic Instructor</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {meta?.short} · question-led
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                title={voiceOn ? 'Mute spoken replies' : 'Unmute spoken replies'}
              >
                {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={reset}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                title="Restart the dialogue"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: '520px' }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <span className="mr-2 mt-0.5 hidden h-7 w-7 shrink-0 place-items-center rounded-lg border border-amber/25 bg-amber/10 text-amber sm:grid">
                    <Sparkles size={12} />
                  </span>
                )}
                <div
                  className={`group relative max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed animate-slide-up ${
                    m.role === 'user'
                      ? 'rounded-br-md border border-violet/25 bg-violet/15 text-slate-100'
                      : m.kind === 'nudge'
                        ? 'rounded-bl-md border border-rose/25 bg-rose/[0.07] text-slate-200'
                        : m.kind === 'complete'
                          ? 'rounded-bl-md border border-emerald/30 bg-emerald/[0.08] text-slate-200'
                          : 'rounded-bl-md border border-white/[0.08] bg-white/[0.04] text-slate-200'
                  }`}
                >
                  {m.kind === 'nudge' && (
                    <span className="mb-1 flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider text-rose">
                      <Compass size={10} /> nudge
                    </span>
                  )}
                  {m.text}
                  {m.role === 'ai' && (
                    <button
                      onClick={() => read(m.text)}
                      className="ml-1 inline-grid h-5 w-5 place-items-center rounded text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                      title="Read aloud"
                      aria-label="Read this message aloud"
                    >
                      <Volume2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-2 pl-9">
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-amber/80"
                      style={{
                        animationName: 'float',
                        animationDuration: '1s',
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 140}ms`,
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-500">thinking through your answer…</span>
              </div>
            )}

            {!completed && exchange && !thinking && (
              <div className="pl-0 sm:pl-9">
                <div className="rounded-2xl border border-amber/20 bg-gradient-to-b from-amber/[0.07] to-transparent p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Target size={11} className="text-amber" />
                      <span className="label text-amber">
                        {exchange.concept} · question {stepIndex + 1} of {exchanges.length}
                      </span>
                    </div>
                    <button
                      onClick={revealHint}
                      className="flex items-center gap-1 rounded-md border border-amber/25 bg-amber/10 px-2 py-0.5 text-[10px] font-semibold text-amber transition hover:bg-amber/20"
                    >
                      <Lightbulb size={10} /> {hintOpen ? 'Hide hint' : 'Hint'}
                    </button>
                  </div>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-100">{exchange.question}</p>
                  {hintOpen && (
                    <p className="mt-2 rounded-lg border border-amber/20 bg-obsidian/40 p-2 text-[11.5px] leading-relaxed text-amber/90">
                      {exchange.hint}
                    </p>
                  )}
                  <div className="mt-3 space-y-1.5">
                    {exchange.options.map((o, idx) => {
                      const wasWrong = (wrong[stepIndex] || new Set()).has(idx)
                      return (
                        <button
                          key={o.text}
                          onClick={() => choose(o, idx)}
                          className={`group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12px] leading-snug transition ${
                            wasWrong
                              ? 'border-rose/20 bg-rose/[0.04] text-slate-500 line-through decoration-rose/40'
                              : 'border-white/[0.08] bg-white/[0.025] text-slate-200 hover:border-amber/35 hover:bg-amber/[0.07] hover:text-white'
                          }`}
                        >
                          <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[8px] ${wasWrong ? 'border-rose/40 text-rose' : 'border-white/20 text-slate-500 group-hover:border-amber/50 group-hover:text-amber'}`}>
                            {wasWrong ? <X size={9} /> : String.fromCharCode(65 + idx)}
                          </span>
                          {o.text}
                          <ArrowRight size={12} className="ml-auto mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-70" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {completed && (
              <div className="animate-slide-up rounded-2xl border border-emerald/25 bg-emerald/[0.06] p-4">
                <div className="flex items-center gap-2">
                  <Trophy size={15} className="text-emerald" />
                  <p className="text-[13px] font-semibold text-emerald">Discovery complete</p>
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">
                  You reconstructed the reasoning with {solved} of {exchanges.length} correct moves
                  {attempts ? ` and ${attempts} productive detour${attempts === 1 ? '' : 's'}` : ''}.
                </p>
                <p className="mt-2.5 rounded-lg border border-white/10 bg-obsidian/50 px-3 py-2 font-mono text-[12.5px] text-white">
                  {session.answer}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" icon={ArrowRight} onClick={() => setTab('summary')}>
                    Test yourself
                  </Button>
                  <Button size="sm" variant="outline" icon={RotateCcw} onClick={reset}>
                    Run it again
                  </Button>
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => setTab('voice')}>
                    Hear the full narration
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.07] bg-white/[0.02] p-3">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitFree()}
                  disabled={completed || thinking}
                  placeholder={completed ? 'Dialogue complete — reset to explore again' : 'Explain your reasoning in your own words…'}
                  className="w-full rounded-xl border border-white/10 bg-obsidian/70 px-3 py-2.5 pr-9 text-[12.5px] text-slate-200 placeholder:text-slate-600 focus:border-amber/40 focus:outline-none focus:ring-2 focus:ring-amber/15 disabled:opacity-60"
                  aria-label="Your reasoning"
                />
                <CornerDownLeft size={12} className="absolute right-3 top-3 text-slate-600" />
              </div>
              <Button variant="primary" tone="amber" icon={Send} size="md" onClick={submitFree} disabled={!input.trim() || completed || thinking}>
                Send
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button onClick={revealHint} className="flex items-center gap-1 text-[10.5px] text-slate-500 transition hover:text-amber">
                <CircleHelp size={11} /> I’m stuck — give me a hint
              </button>
              <button onClick={revealSolution} className="flex items-center gap-1 text-[10.5px] text-slate-500 transition hover:text-rose">
                <EyeOff size={11} /> Show the full solution
              </button>
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-slate-600">
                hints used: {hintsUsed}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-amber" />
                <p className="label text-amber">Discovery map</p>
              </div>
              <span className="font-mono text-[10.5px] text-slate-500">
                {solved}/{exchanges.length}
              </span>
            </div>
            <Progress value={exchanges.length ? solved / exchanges.length : 0} tone="amber" className="mt-2.5" />
            <div className="mt-3 space-y-1.5">
              {exchanges.map((ex, i) => {
                const done = i < solved || completed
                const active = i === stepIndex && !completed
                return (
                  <div key={ex.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${active ? 'border-amber/25 bg-amber/[0.06]' : 'border-transparent'}`}>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] ${
                        done
                          ? 'border-emerald/40 bg-emerald/15 text-emerald'
                          : active
                            ? 'border-amber/40 bg-amber/15 text-amber'
                            : 'border-white/10 text-slate-600'
                      }`}
                    >
                      {done ? <Check size={10} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[11.5px] ${active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ex.concept}
                    </span>
                    {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                { k: 'correct', v: solved, c: 'text-emerald' },
                { k: 'detours', v: attempts, c: 'text-rose' },
                { k: 'accuracy', v: `${accuracy}%`, c: 'text-amber' },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5 text-center">
                  <p className={`font-mono text-[13px] font-semibold ${s.c}`}>{s.v}</p>
                  <p className="font-mono text-[8.5px] uppercase tracking-wider text-slate-500">{s.k}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-amber/20 bg-amber/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber" />
              <p className="label text-amber">Hint channel</p>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
              {hintOpen && exchange ? exchange.hint : 'Hints are free. Ask for one whenever the next move is not obvious — the goal is reasoning, not guessing.'}
            </p>
            {!hintOpen && (
              <button
                onClick={revealHint}
                disabled={completed}
                className="mt-2.5 flex items-center gap-1 rounded-lg border border-amber/25 bg-amber/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber transition hover:bg-amber/20 disabled:opacity-50"
              >
                <CircleHelp size={11} /> Reveal a hint
              </button>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Gauge size={13} className="text-violet" />
              <p className="label">Ground rules</p>
            </div>
            <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-slate-400">
              <li>· The tutor asks; you derive. No answers before reasoning.</li>
              <li>· A wrong move is data — read the nudge, then try again.</li>
              <li>· Type freely: the engine matches your mathematical vocabulary.</li>
              <li>· Switch off Socratic guidance any time for the direct explanation.</li>
            </ul>
          </Card>

          <Card className="relative overflow-hidden p-4">
            <div className="flex items-center gap-2">
              <Lock size={13} className="text-slate-500" />
              <p className="label">Answer vault</p>
            </div>
            <div className="mt-2 rounded-lg border border-white/[0.07] bg-obsidian/60 p-3">
              <p className={`select-none font-mono text-[13px] ${completed ? 'text-emerald' : 'text-slate-600 blur-[5px]'}`}>
                {session.answer}
              </p>
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">
              {completed ? 'unlocked — reasoned, not copied' : 'unlocks when the dialogue completes'}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" icon={Eye} onClick={revealSolution} disabled={completed}>
                Reveal
              </Button>
              <Button size="sm" variant="ghost" icon={RotateCcw} onClick={reset}>
                Reset
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
