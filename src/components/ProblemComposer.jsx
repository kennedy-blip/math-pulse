import { useMemo, useState } from 'react'
import { ArrowRight, CornerDownLeft, Eraser, Mic, MicOff, ScanSearch, Sparkles, Wand2 } from 'lucide-react'
import { SAMPLE_PROMPTS } from '../data/problems.js'
import { classifyTopic } from '../lib/classify.js'
import { useVoiceInput } from '../hooks/useVoiceInput.js'
import { useApp } from '../lib/appContext.jsx'
import { Badge, Button, Formula, accent } from './ui.jsx'

const EXAMPLES = [
  'Find the derivative of f(x) = 3x² + 2x at x = 1',
  'Maximise x²y subject to x + y = 6',
  'Solve 2x + 3y = 12 and x − y = 1',
  'X ~ N(500, 100²), find P(X > 650)',
]

export default function ProblemComposer({ hero = false, onSolved }) {
  const { solve, session } = useApp()
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)

  const live = useMemo(() => classifyTopic(text), [text])
  const meta = live.disciplineMeta
  const a = accent(meta?.accent || 'violet')

  const { supported, listening, error, toggle } = useVoiceInput({
    onTranscript: (transcript) => setText(transcript),
  })

  const submit = () => {
    if (!text.trim()) return
    solve(text)
    onSolved?.()
    setText('')
  }

  const showDetection = text.trim().length > 2

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-panel/60 backdrop-blur-xl transition-all duration-300 ${
        focused ? 'border-violet/40 shadow-[0_0_60px_-24px_rgba(139,92,246,.9)]' : 'border-white/[0.08]'
      }`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${a.grad} opacity-60`} />
      <div className={`relative ${hero ? 'p-5 sm:p-7' : 'p-4'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`label ${a.text}`}>{hero ? 'New tutoring session' : 'Ask a follow-up'}</p>
            <h1 className={`mt-1 font-bold tracking-tight text-white ${hero ? 'text-2xl sm:text-[28px]' : 'text-base'}`}>
              {hero ? 'What are we solving today?' : 'Ask MathPulse'}
            </h1>
            {hero && (
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-400">
                Type or speak a problem. MathPulse detects the discipline, narrates the reasoning with real-world
                analogies, and synthesizes the right diagram by itself.
              </p>
            )}
          </div>
          <Badge tone="violet" icon={Wand2} pulse>
            {session ? 'session live' : 'ready'}
          </Badge>
        </div>

        <div className="relative mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
            }}
            rows={hero ? 4 : 2}
            placeholder="e.g. Evaluate ∫₀² (3x² + 2x) dx and explain the area it measures…"
            aria-label="Math problem"
            className="w-full resize-none rounded-xl border border-white/10 bg-obsidian/70 px-4 py-3.5 pr-14 font-mono text-[13px] leading-relaxed text-slate-100 placeholder:font-sans placeholder:text-slate-600 focus:border-violet/40 focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
          <button
            onClick={() => toggle(text)}
            aria-pressed={listening}
            title={supported ? (listening ? 'Stop dictating' : 'Dictate your problem') : 'Voice input unavailable'}
            className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-lg border transition ${
              listening
                ? 'border-rose/50 bg-rose/15 text-rose'
                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/25 hover:text-white'
            } ${!supported ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {listening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
          </button>
          {listening && (
            <div className="absolute inset-x-3 bottom-2.5 flex items-center gap-2 rounded-lg bg-rose/10 px-2 py-1">
              <span className="flex items-center gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full bg-rose"
                    style={{
                        height: `${6 + (i % 3) * 3}px`,
                        animationName: 'float',
                        animationDuration: `${0.7 + i * 0.12}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                      }}
                  />
                ))}
              </span>
              <span className="text-[10.5px] font-medium text-rose">Listening… speak your problem</span>
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-[11px] text-rose">{error}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Try</span>
          {(hero ? SAMPLE_PROMPTS : SAMPLE_PROMPTS.slice(0, 4)).map((s) => (
            <button
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setText(s.prompt)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium text-slate-400 transition hover:border-violet/30 hover:bg-violet/10 hover:text-violet-soft"
            >
              {s.label}
            </button>
          ))}
        </div>

        {showDetection && (
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 animate-slide-up">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScanSearch size={13} className={a.text} />
                <span className="label">Topic auto-detector</span>
                <Badge tone={meta.accent}>{meta.name}</Badge>
              </div>
              <span className={`font-mono text-[11px] font-semibold ${a.text}`}>{live.confidence}% confidence</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${a.solid} transition-all duration-500`}
                style={{ width: `${live.confidence}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {(live.signals.length ? live.signals : ['awaiting signal']).slice(0, 4).map((s) => (
                <span key={s} className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] text-slate-400">
                  {s}
                </span>
              ))}
              <span className="ml-auto font-mono text-[9.5px] text-slate-600">{live.reason}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" size={hero ? 'lg' : 'md'} icon={Sparkles} onClick={submit} disabled={!text.trim()} iconRight={ArrowRight}>
            Solve &amp; Narrate
          </Button>
          {text && (
            <Button size={hero ? 'lg' : 'md'} icon={Eraser} variant="ghost" onClick={() => setText('')}>
              Clear
            </Button>
          )}
          <span className="ml-auto hidden items-center gap-1.5 font-mono text-[10px] text-slate-600 sm:flex">
            <CornerDownLeft size={11} /> ⌘/Ctrl + Enter
          </span>
        </div>

        {hero && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setText(e)}
                onMouseDown={(ev) => ev.preventDefault()}
                className="group rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left transition hover:border-violet/25 hover:bg-violet/[0.06]"
              >
                <Formula size="sm" className="line-clamp-2 text-slate-400 transition group-hover:text-slate-200">
                  {e}
                </Formula>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
