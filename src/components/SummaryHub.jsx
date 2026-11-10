import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  BookOpenCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  GraduationCap,
  Layers,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  ScrollText,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import { speakOnce } from '../hooks/useNarration.js'
import PracticeArena from './PracticeArena'
import { Badge, Button, Card, Drawer, Formula, SectionHeader, accent } from './ui.jsx'

const TRAP_META = {
  'Exam Trap': { icon: AlertTriangle, tone: 'rose' },
  'Conceptual Pitfall': { icon: Lightbulb, tone: 'amber' },
  'Viva Question': { icon: MessagesSquare, tone: 'violet' },
}

const DIFF_TONE = { 'Warm-up': 'emerald', Core: 'cyan', Challenge: 'rose' }

export default function SummaryHub() {
  const { session, setTab, pushToast, voiceOn } = useApp()
  const [drawer, setDrawer] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [expandedTrap, setExpandedTrap] = useState(null)
  const [checks, setChecks] = useState({ 0: true, 1: true })

  const summaryText = useMemo(() => {
    if (!session) return ''
    return [
      `${session.title}`,
      `Theorem: ${session.summary.theorem}`,
      `Formula: ${session.summary.formula}`,
      ...session.summary.takeaways.map((t) => `• ${t}`),
      `Answer: ${session.answer}`,
    ].join('\n')
  }, [session])

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Load a problem to generate summary notes.</p>
        <Button className="mx-auto mt-4" variant="primary" onClick={() => setTab('voice')}>
          Open AI Solver
        </Button>
      </Card>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      pushToast({ title: 'Summary copied', body: 'Paste it into your notes app.', tone: 'emerald', kind: 'success' })
    } catch {
      pushToast({ title: 'Clipboard blocked', body: 'Your browser denied clipboard access.', tone: 'rose', kind: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={BookOpenCheck}
        tone="emerald"
        eyebrow="Consolidation engine"
        title="Summary &amp; Quiz Hub"
        sub="AI summary notes capture the theorem, formula and conceptual takeaways — then exam traps and adaptive practice close the loop."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald" icon={Sparkles}>
              auto-synthesized
            </Badge>
            <Button size="sm" variant="outline" icon={Copy} onClick={copy}>
              Copy notes
            </Button>
            <Button size="sm" variant="primary" tone="emerald" icon={ScrollText} onClick={() => setDrawer(true)}>
              Explore similar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        {/* summary notes */}
        <Card className="min-w-0 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-r from-emerald/[0.09] to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <BookMarked size={14} className="text-emerald" />
              <p className="label text-emerald">AI summary notes</p>
            </div>
            <button
              onClick={() => {
                if (!voiceOn) {
                  pushToast({ title: 'Voice is muted', body: 'Enable the tutor to hear the summary.', tone: 'amber', kind: 'info' })
                  return
                }
                speakOnce(`${session.summary.theorem}. ${session.summary.takeaways.join('. ')}`)
              }}
              className="rounded-md p-1 text-emerald/70 transition hover:bg-emerald/10 hover:text-emerald"
              aria-label="Read summary aloud"
              title="Read summary aloud"
            >
              <ListChecks size={14} />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="emerald" dot>
                {session.summary.theorem}
              </Badge>
              <Badge tone="slate">{session.disciplineMeta?.short}</Badge>
              <Badge tone="violet">{session.minutes} min</Badge>
            </div>

            <h3 className="mt-3 text-base font-semibold leading-snug text-white sm:text-lg">{session.title}</h3>

            <div className="mt-3 rounded-xl border border-emerald/20 bg-emerald/[0.05] p-3">
              <p className="label text-emerald">Core formula</p>
              <Formula block size="lg" className="mt-1 break-words text-emerald">
                {session.summary.formula}
              </Formula>
            </div>

            <div className="mt-4">
              <p className="label">Conceptual takeaways</p>
              <ul className="mt-2 space-y-1.5">
                {session.summary.takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald/15 text-emerald">
                      <Check size={9} strokeWidth={3.5} />
                    </span>
                    <span className="text-[12px] leading-relaxed text-slate-300">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <p className="label">Terminology</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {session.summary.terms.map((t) => (
                  <div key={t.term} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-cyan">{t.term}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{t.def}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.07] bg-obsidian/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="label">Final answer</p>
                <p className="mt-0.5 break-words font-mono text-[12.5px] font-semibold text-white">{session.answer}</p>
              </div>
              <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => setTab('handwriting')}>
                See handwritten
              </Button>
            </div>
          </div>
        </Card>

        {/* similar examples */}
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-violet" />
                <p className="label text-violet">Explore similar examples</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">3 variations</span>
            </div>
            <div className="space-y-2 p-3">
              {session.similar.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setDrawer(true)}
                  className="group flex w-full items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition hover:border-violet/25 hover:bg-violet/[0.05]"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[9.5px] text-slate-400">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[11.5px] font-medium text-slate-200">{s.title}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <span className={`rounded border px-1 py-px font-mono text-[8.5px] uppercase tracking-wider ${accent(DIFF_TONE[s.difficulty] || 'slate').border} ${accent(DIFF_TONE[s.difficulty] || 'slate').text}`}>
                        {s.difficulty}
                      </span>
                      <span className="truncate font-mono text-[9.5px] text-slate-500">{s.hint}</span>
                    </span>
                  </span>
                  <ArrowRight size={12} className="mt-1 shrink-0 text-slate-600 transition group-hover:text-violet-soft" />
                </button>
              ))}
              <Button size="sm" variant="outline" icon={ScrollText} className="mt-1 w-full" onClick={() => setDrawer(true)}>
                Open examples drawer
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-emerald" />
              <p className="label text-emerald">Mastery checklist</p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {[
                'Can state the governing theorem from memory',
                'Can reproduce the key step without notes',
                'Can explain the analogy to a friend',
                'Can spot the classic exam trap',
                'Can solve one harder variant',
              ].map((t, i) => (
                <li key={t}>
                  <button
                    onClick={() => setChecks((c) => ({ ...c, [i]: !c[i] }))}
                    className="flex w-full items-center gap-2 text-left text-[11.5px] text-slate-400 transition hover:text-slate-200"
                  >
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${checks[i] ? 'border-emerald/40 bg-emerald/15 text-emerald' : 'border-white/15 text-slate-600'}`}>
                      {checks[i] && <Check size={9} strokeWidth={3} />}
                    </span>
                    {t}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 font-mono text-[9.5px] text-slate-600">self-check · tap to mark mastery</p>
          </Card>

          <Card className="border-rose/20 bg-rose/[0.04] p-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-rose" />
              <p className="label text-rose">Examiner mindset</p>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
              Markers reward named theorems, units, and boundary checks. The traps below are the exact places marks
              disappear.
            </p>
          </Card>
        </div>
      </div>

      {/* test traps */}
      <Card className="p-4 sm:p-5">
        <SectionHeader
          icon={AlertTriangle}
          tone="rose"
          eyebrow="Threat model"
          title="How You Can Be Tested"
          sub="Common exam traps, conceptual pitfalls and viva-style questions generated from this solution graph."
          right={<Badge tone="rose" icon={Target}>{session.traps.length} traps</Badge>}
        />
        <div className="mt-4 grid gap-2.5 md:grid-cols-2">
          {session.traps.map((t, i) => {
            const meta = TRAP_META[t.type] || TRAP_META['Exam Trap']
            const a = accent(meta.tone)
            const open = expandedTrap === i
            return (
              <button
                key={`${t.type}-${i}`}
                onClick={() => setExpandedTrap(open ? null : i)}
                className={`rounded-xl border p-3 text-left transition ${a.border} ${a.bg} hover:bg-white/[0.05]`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${a.border} bg-white/[0.04] ${a.text}`}>
                    <meta.icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[8.5px] uppercase tracking-[0.16em] ${a.text}`}>{t.type}</span>
                      <ChevronDown size={11} className={`ml-auto shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="mt-1 text-[12.5px] font-semibold leading-snug text-slate-100">{t.title}</p>
                    <p className={`mt-1 text-[11.5px] leading-relaxed text-slate-400 ${open ? '' : 'line-clamp-2'}`}>{t.body}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber/15 bg-amber/[0.04] px-3 py-2">
          <Lightbulb size={12} className="shrink-0 text-amber" />
          <p className="text-[10.5px] leading-relaxed text-slate-400">
            Rehearse the viva answer out loud. If you can say it in one sentence with units, you own it.
          </p>
        </div>
      </Card>

      <div id="practice-arena" className="scroll-mt-28">
        <PracticeArena />
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Explore similar examples"
        eyebrow="Progressive difficulty"
        icon={Layers}
        width="max-w-xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-slate-500">Same skill · escalating demand</p>
            <Button
              size="sm"
              variant="primary"
              tone="emerald"
              icon={Trophy}
              onClick={() => {
                setDrawer(false)
                setTab('summary')
                document.getElementById('practice-arena')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Practice these
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-[12px] leading-relaxed text-slate-400">
            Three alternative variations of the current problem. Work each on paper before revealing the hint — the
            progression is designed to stretch exactly one new skill at a time.
          </p>
          {session.similar.map((s, i) => {
            const tone = DIFF_TONE[s.difficulty] || 'slate'
            const a = accent(tone)
            return (
              <div key={s.title} className={`rounded-xl border ${a.border} bg-white/[0.02] p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${a.bg} font-mono text-[10px] ${a.text}`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[12.5px] font-semibold leading-snug text-white">{s.title}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">{s.prompt}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider ${a.border} ${a.text}`}>
                    {s.difficulty}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Lightbulb}
                    onClick={() => setRevealed((r) => ({ ...r, [`h${i}`]: !r[`h${i}`] }))}
                  >
                    {revealed[`h${i}`] ? 'Hide hint' : 'Hint'}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={ClipboardCheck}
                    onClick={() => setRevealed((r) => ({ ...r, [`a${i}`]: !r[`a${i}`] }))}
                  >
                    {revealed[`a${i}`] ? 'Hide answer' : 'Answer'}
                  </Button>
                </div>
                {revealed[`h${i}`] && (
                  <p className="mt-2 rounded-lg border border-amber/20 bg-amber/[0.06] p-2 text-[11px] leading-relaxed text-amber/90">
                    {s.hint}
                  </p>
                )}
                {revealed[`a${i}`] && (
                  <p className="mt-1.5 rounded-lg border border-emerald/20 bg-emerald/[0.06] p-2 font-mono text-[11px] leading-relaxed text-emerald">
                    {s.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Drawer>
    </div>
  )
}
