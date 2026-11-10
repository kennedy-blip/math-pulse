import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AreaChart,
  Bell,
  Boxes,
  ChevronRight,
  Compass,
  Crosshair,
  Eye,
  Grid3x3,
  Info,
  LineChart,
  MousePointerClick,
  Sparkles,
  Triangle,
  Wand2,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/appContext.jsx'
import TangentDiagram from './diagrams/TangentDiagram'
import AreaDiagram from './diagrams/AreaDiagram'
import ContourDiagram from './diagrams/ContourDiagram'
import LinearDiagram from './diagrams/LinearDiagram'
import BellDiagram from './diagrams/BellDiagram'
import TriangleDiagram from './diagrams/TriangleDiagram'
import { Badge, Button, Card, Formula, SectionHeader, accent } from './ui.jsx'

export const DIAGRAM_META = {
  tangent: {
    label: 'Tangent & Derivative',
    icon: LineChart,
    accent: 'violet',
    tag: 'function graph',
    why: 'A derivative is a slope, so the picture must show a tangent line touching the curve at the evaluation point.',
    component: TangentDiagram,
  },
  area: {
    label: 'Accumulation / Riemann',
    icon: AreaChart,
    accent: 'cyan',
    tag: 'area plot',
    why: 'A definite integral is accumulated area, so thin rectangles under the curve make the limit visible.',
    component: AreaDiagram,
  },
  contour: {
    label: 'Level Curves & Constraint',
    icon: Compass,
    accent: 'cyan',
    tag: 'contour plot',
    why: 'Constrained optimisation is tangency between level sets, which is exactly what a contour map reveals.',
    component: ContourDiagram,
  },
  linear: {
    label: 'Intersecting Constraints',
    icon: Grid3x3,
    accent: 'emerald',
    tag: 'coordinate geometry',
    why: 'Each linear equation is a line; the solution is their common point, so the visual is the intersection.',
    component: LinearDiagram,
  },
  bell: {
    label: 'Normal Distribution',
    icon: Bell,
    accent: 'amber',
    tag: 'density curve',
    why: 'A continuous probability is an area under a density, so the shaded tail is the probability itself.',
    component: BellDiagram,
  },
  triangle: {
    label: 'Angle Geometry',
    icon: Triangle,
    accent: 'cyan',
    tag: 'geometric figure',
    why: 'Angle relationships are easiest to verify in an angle-accurate figure with proportional arcs.',
    component: TriangleDiagram,
  },
}

/* inline variant used inside the voice view */
export function AutoDiagramInline({ kind, compact = true }) {
  const { session } = useApp()
  const meta = DIAGRAM_META[kind] || DIAGRAM_META.tangent
  const Comp = meta.component
  return (
    <Comp
      key={`${session?.id || 'none'}-${kind}`}
      compact={compact}
      expr={session?.diagram?.fn}
      bounds={session?.diagram?.bounds}
    />
  )
}

export default function AutoDiagram() {
  const { session, setTab } = useApp()
  const [kind, setKind] = useState(session?.diagram?.kind || 'tangent')

  useEffect(() => {
    setKind(session?.diagram?.kind || 'tangent')
  }, [session?.id, session?.diagram?.kind])

  const activeKind = DIAGRAM_META[kind] ? kind : 'tangent'
  const meta = DIAGRAM_META[activeKind]
  const Comp = meta.component
  const a = accent(meta.accent)
  const isNative = session?.diagram?.kind === activeKind

  const stepNotes = useMemo(
    () => (session?.steps || []).filter((s) => s.diagramNote),
    [session],
  )

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-400">Load a problem to synthesize diagrams.</p>
        <Button className="mx-auto mt-4" variant="primary" onClick={() => setTab('voice')}>
          Open AI Solver
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Wand2}
        tone="cyan"
        eyebrow="Autonomous visual reasoning"
        title="Auto-Diagram Synthesizer"
        sub="MathPulse selects the visual grammar that matches the mathematics — no prompt required. Every figure is interactive: drag points, move sliders, and watch the algebra respond."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald" icon={Sparkles} pulse>
              auto-generated
            </Badge>
            <Badge tone="slate">{session.disciplineMeta?.short}</Badge>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-gradient-to-r ${a.grad} px-4 py-3`}>
            <div className="flex items-center gap-2.5">
              <span className={`grid h-8 w-8 place-items-center rounded-lg border ${a.border} ${a.bg} ${a.text}`}>
                <meta.icon size={15} />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-white">{meta.label}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {meta.tag} · {isNative ? 'native to this problem' : 'synthesized on demand'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={meta.accent} icon={Zap}>
                live
              </Badge>
              <Badge tone="slate" icon={MousePointerClick}>
                interactive
              </Badge>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <Comp
              key={`${session.id}-${activeKind}`}
              compact={false}
              expr={session.diagram?.fn}
              bounds={session.diagram?.bounds}
            />
          </div>

          <div className="flex flex-wrap items-start gap-2 border-t border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <Info size={13} className="mt-0.5 shrink-0 text-slate-500" />
            <p className="flex-1 text-[11.5px] leading-relaxed text-slate-400">{session.diagram?.caption || meta.why}</p>
            <Formula tone="slate" size="sm" className="text-slate-500">
              {session.diagram?.formula}
            </Formula>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-cyan" />
              <p className="label text-cyan">Why this visual?</p>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">{meta.why}</p>
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
              <div className="flex items-center justify-between">
                <p className="label">detector signal</p>
                <span className="font-mono text-[10.5px] text-emerald">{session.confidence}%</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald" style={{ width: `${session.confidence}%` }} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-slate-400">
                {session.disciplineMeta?.name} → <span className="text-cyan">{meta.tag}</span>
              </p>
            </div>
            <div className="mt-3 space-y-1.5">
              {(session.detected?.signals || session.tags || []).slice(0, 4).map((s) => (
                <div key={s} className="flex items-center gap-2 text-[11.5px] text-slate-400">
                  <span className="h-1 w-1 rounded-full bg-cyan" />
                  <span className="truncate">{s}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes size={14} className="text-violet" />
                <p className="label text-violet">Visual vocabulary</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{Object.keys(DIAGRAM_META).length} renderers</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {Object.entries(DIAGRAM_META).map(([key, m]) => {
                const selected = key === activeKind
                const native = session.diagram?.kind === key
                return (
                  <button
                    key={key}
                    onClick={() => setKind(key)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                      selected
                        ? 'border-white/20 bg-white/[0.07]'
                        : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border ${accent(m.accent).border} ${accent(m.accent).bg} ${accent(m.accent).text}`}>
                      <m.icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-200">{m.label}</span>
                      <span className="block font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
                        {native ? 'chosen automatically' : m.tag}
                      </span>
                    </span>
                    {native && <span className="h-1.5 w-1.5 rounded-full bg-emerald" title="Native diagram" />}
                    <ChevronRight size={13} className={selected ? 'text-white' : 'text-slate-600'} />
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber" />
            <p className="label text-amber">Autonomous trigger log</p>
          </div>
          <Badge tone="amber" icon={Activity}>
            synced to narration
          </Badge>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {stepNotes.length === 0 && (
            <p className="text-[12px] text-slate-500">No step-level diagram triggers in this session.</p>
          )}
          {stepNotes.map((s, i) => (
            <div key={s.id} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-amber/10 font-mono text-[10px] text-amber">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-[12px] font-medium text-slate-200">{s.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{s.diagramNote}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
