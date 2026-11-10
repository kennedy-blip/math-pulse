import { useState } from 'react'
import {
  Check,
  CheckCheck,
  Circle,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Highlighter,
  NotebookPen,
  PenLine,
  PenTool,
  Printer,
  Ruler,
  Sparkles,
  StickyNote,
  Type,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { Badge, Button, Card, Formula, SectionHeader, Toggle, accent } from './ui.jsx'

const INKS = [
  { id: 'navy', label: 'Midnight blue', value: '#1e2b4a', swatch: 'bg-[#1e2b4a]' },
  { id: 'violet', label: 'Violet ink', value: '#4c1d95', swatch: 'bg-[#4c1d95]' },
  { id: 'graphite', label: 'Graphite', value: '#334155', swatch: 'bg-[#334155]' },
  { id: 'teal', label: 'Teal ink', value: '#0f766e', swatch: 'bg-[#0f766e]' },
]

function ScribbleCheck({ className = '' }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <path
        d="M6 22 C 13 20, 18 28, 24 33 C 33 18, 44 9, 56 4"
        fill="none"
        stroke="#10b981"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="120"
        className="animate-draw"
      />
    </svg>
  )
}

function Doodle() {
  return (
    <svg viewBox="0 0 120 80" className="h-16 w-24 text-slate-500/40" aria-hidden>
      <path d="M8 62 C 30 62, 40 16, 52 16 C 62 16, 58 52, 70 52 C 82 52, 92 26, 112 26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 70 L 112 70" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 70 L 8 8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M60 12 l0 -6 M57 9 l6 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function NotesSheet({ problem, ink, ruled = true, marginNotes = true, showDoodles = true, printMode = false }) {
  if (!problem) {
    return (
      <div className="paper p-10 text-center">
        <p className="hand-ink text-2xl text-slate-600">Waiting for an equation to write…</p>
      </div>
    )
  }
  const inkStyle = { color: ink.value }
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className={`paper ${printMode ? 'print-sheet' : ''}`}>
      {ruled && <div className="paper-lines opacity-70" />}
      {marginNotes && <div className="paper-margin" />}
      <div className="relative px-5 py-7 sm:px-10 sm:py-9">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-400/30 pb-3">
          <div>
            <p className="hand-ink text-[30px] leading-none" style={inkStyle}>
              {problem.disciplineMeta?.short} · Guided Notes
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              MathPulse handwriting engine · {date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-slate-400/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
              Session note
            </span>
            {showDoodles && <Doodle />}
          </div>
        </div>

        {/* prompt */}
        <div className="mt-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">Given</p>
          <p className="hand-ink mt-1 max-w-3xl text-[20px] leading-snug" style={inkStyle}>
            {problem.prompt.length > 150 ? `${problem.prompt.slice(0, 147)}…` : problem.prompt}
          </p>
          <div className="mt-2 inline-block max-w-full rounded border-l-2 border-slate-400/60 bg-slate-900/[0.035] px-2.5 py-1">
            <span className="break-words font-mono text-[13px] font-semibold text-slate-800">{problem.formula}</span>
          </div>
        </div>

        {/* steps */}
        <ol className="mt-5 space-y-4">
          {problem.steps.map((s, i) => (
            <li key={s.id} className={`relative ${marginNotes ? 'pl-0 sm:pl-16' : ''}`}>
              {marginNotes && (
                <div className="absolute left-0 top-0 hidden w-12 sm:block">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full border-2 font-handalt text-[17px]"
                    style={{ borderColor: ink.value, color: ink.value }}
                  >
                    {i + 1}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className={`${marginNotes ? 'sm:hidden' : ''} grid h-7 w-7 shrink-0 place-items-center self-center rounded-full border-2 font-handalt text-[14px]`}
                  style={{ borderColor: ink.value, color: ink.value }}
                >
                  {i + 1}
                </span>
                <p className="hand-ink text-[25px] leading-snug" style={inkStyle}>
                  {s.title}
                </p>
              </div>
              <p className="mt-1 break-words font-handalt text-[18px] leading-relaxed text-slate-800">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-400/70 align-middle" />
                {s.formula}
              </p>
              <p className="mt-1 max-w-2xl font-handalt text-[15px] leading-relaxed text-slate-600">
                {i === 0 ? s.narration : s.insight}
              </p>
              {s.hint && (
                <p className="mt-1.5 font-handalt text-[13.5px] italic leading-relaxed text-amber-800/90">
                  ✎ {s.hint}
                </p>
              )}
              {i === 0 && s.analogy && (
                <p className="mt-1 max-w-xl font-handalt text-[13.5px] italic leading-relaxed text-amber-800/90">
                  ↳ {s.analogy}
                </p>
              )}
            </li>
          ))}
        </ol>

        {/* final answer */}
        <div className="relative mt-6">
          <div className="relative inline-block max-w-full">
            <span className="absolute -left-1 bottom-1 h-[8px] w-[calc(100%_+_8px)] -skew-x-6 bg-amber-300/50" aria-hidden />
            <p className="relative font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">Final answer</p>
            <p
              className="hand-underline relative mt-1 break-words text-[30px] font-semibold leading-snug"
              style={{ ...inkStyle, fontFamily: 'Caveat, "Segoe Print", cursive' }}
            >
              {problem.answer}
            </p>
          </div>
          <div className="absolute -right-1 -top-4 sm:right-4">
            <ScribbleCheck className="h-11 w-16" />
          </div>
          <p className="mt-2 max-w-xl font-handalt text-[14px] leading-relaxed text-slate-600">{problem.answerNote}</p>
        </div>

        {marginNotes && (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rotate-[-1.5deg] rounded-sm border border-emerald-500/30 bg-emerald-100/70 px-2.5 py-1.5 shadow-sm">
              <p className="font-handalt text-[12px] leading-tight text-emerald-900">
                ✓ Always verify by substituting back
              </p>
            </div>
            <div className="rotate-[1deg] rounded-sm border border-rose-500/30 bg-rose-100/70 px-2.5 py-1.5 shadow-sm">
              <p className="font-handalt text-[12px] leading-tight text-rose-900">
                ✗ Don’t lose the constant multiplier
              </p>
            </div>
          </div>
        )}

        <div className="mt-7 flex items-end justify-between border-t border-slate-400/30 pt-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
            Generated by MathPulse · {problem.disciplineMeta?.name}
          </p>
          <p className="hand-ink text-[18px] text-slate-400">— MathPulse AI</p>
        </div>
      </div>
    </div>
  )
}

export function PrintSheet() {
  const { session } = useApp()
  return (
    <div id="print-root">
      <NotesSheet problem={session} ink={INKS[0]} ruled marginNotes={false} showDoodles={false} printMode />
    </div>
  )
}

export default function HandwritingView() {
  const { session, exportPdf, setTab } = useApp()
  const [inkId, setInkId] = useState('navy')
  const [ruled, setRuled] = useState(true)
  const [marginNotes, setMarginNotes] = useState(true)
  const [doodles, setDoodles] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const ink = INKS.find((i) => i.id === inkId) || INKS[0]

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Load a problem to write out the solution.</p>
        <Button className="mx-auto mt-4" variant="primary" onClick={() => setTab('voice')}>
          Open AI Solver
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={PenTool}
        tone="cyan"
        eyebrow="Digital ink studio"
        title="Handwriting Studio"
        sub="The same reasoning, rendered as tablet-style ink notes: numbered steps, margin hints, and an underlined final answer ready to export."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald" icon={Sparkles}>
              auto-typeset
            </Badge>
            <Button variant="primary" tone="cyan" icon={FileDown} onClick={exportPdf}>
              Export Handwritten PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        {/* toolbar */}
        <div className="order-2 min-w-0 space-y-3 xl:sticky xl:top-[150px] xl:order-1">
          <Card className="p-3.5">
            <div className="flex items-center gap-2">
              <PenLine size={13} className="text-cyan" />
              <p className="label text-cyan">Ink</p>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-2">
              {INKS.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setInkId(i.id)}
                  title={i.label}
                  aria-label={i.label}
                  className={`group flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5 transition ${
                    inkId === i.id ? 'border-cyan/40 bg-cyan/10' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full ${i.swatch} ring-1 ring-white/30`} />
                  <span className="truncate text-[10.5px] text-slate-400">{i.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center gap-2">
              <NotebookPen size={13} className="text-violet" />
              <p className="label text-violet">Paper &amp; ink</p>
            </div>
            <div className="mt-3 space-y-3">
              <Toggle checked={ruled} onChange={setRuled} label="Ruled lines" tone="cyan" />
              <Toggle checked={marginNotes} onChange={setMarginNotes} label="Margin notes" tone="amber" />
              <Toggle checked={doodles} onChange={setDoodles} label="Doodles" tone="violet" />
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center gap-2">
              <Printer size={13} className="text-emerald" />
              <p className="label text-emerald">Export</p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Opens your browser’s print dialog. Choose <span className="text-slate-300">Save as PDF</span> for a clean
              A4 handwritten sheet.
            </p>
            <Button size="sm" className="mt-2.5 w-full" variant="primary" tone="cyan" icon={Download} onClick={exportPdf}>
              Download sheet
            </Button>
            <Button size="sm" className="mt-1.5 w-full" variant="ghost" icon={Eye} onClick={() => setExpanded(true)}>
              Focus mode
            </Button>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center gap-2">
              <Highlighter size={13} className="text-amber" />
              <p className="label text-amber">Legend</p>
            </div>
            <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-slate-400">
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> formula line</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> margin hint</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> highlighted answer</li>
            </ul>
          </Card>
        </div>

        {/* paper */}
        <div className="order-1 space-y-3 xl:order-2">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center gap-2">
              <Ruler size={13} className="text-slate-500" />
              <span className="font-mono text-[10.5px] text-slate-500">A4 · 210 × 297 mm · digital ink</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge tone="slate" icon={Type}>{problem_font_label(session)}</Badge>
              <Badge tone="slate" icon={StickyNote}>{marginNotes ? 'margin notes on' : 'clean sheet'}</Badge>
            </div>
          </div>

          <NotesSheet problem={session} ink={ink} ruled={ruled} marginNotes={marginNotes} showDoodles={doodles} />

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="label">Related</span>
            <Button size="sm" variant="outline" icon={PenLine} onClick={() => setTab('diagram')}>
              View source diagram
            </Button>
            <Button size="sm" variant="outline" icon={CheckCheck} onClick={() => setTab('summary')}>
              Test this proof
            </Button>
            <Button size="sm" variant="ghost" icon={EyeOff} onClick={() => setTab('voice')}>
              Back to voice
            </Button>
            <span className="ml-auto flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-wider text-slate-600">
              <Check size={10} /> synced to session
            </span>
          </div>
        </div>
      </div>

      {/* focus mode */}
      {expanded && (
        <div className="fixed inset-0 z-[75] overflow-y-auto bg-black/85 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto max-w-4xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-slate-300">Handwriting focus mode</p>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" tone="cyan" icon={FileDown} onClick={exportPdf}>
                  Export PDF
                </Button>
                <Button size="sm" variant="outline" icon={EyeOff} onClick={() => setExpanded(false)}>
                  Close
                </Button>
              </div>
            </div>
            <NotesSheet problem={session} ink={ink} ruled={ruled} marginNotes={marginNotes} showDoodles={doodles} />
          </div>
        </div>
      )}
    </div>
  )
}

function problem_font_label(session) {
  const d = session.disciplineMeta?.short || 'Calculus'
  return `${d} ink`
}
