import { useMemo, useRef, useState } from 'react'
import ChartShell, { dataXFromEvent, AxisTag } from './ChartShell'
import { functionModel } from '../../lib/classify.js'

const FALLBACK = {
  f: (x) => 3 * x * x + 2 * x,
  df: (x) => 6 * x + 2,
}

export default function TangentDiagram({ compact = false, expr }) {
  const model = useMemo(() => functionModel(expr), [expr])
  const f = model?.f || FALLBACK.f
  const df = model?.df || FALLBACK.df
  const [a, setA] = useState(1)
  const svgRef = useRef(null)
  const dragging = useRef(false)

  const geo = { width: 640, pad: { l: 44, r: 18, t: 20, b: 34 }, xDomain: [-1.6, 2.6] }
  const xDom = geo.xDomain

  const samples = Array.from({ length: 150 }, (_, i) => {
    const x = xDom[0] + (i / 149) * (xDom[1] - xDom[0])
    return [x, f(x)]
  })
  let lo = Infinity
  let hi = -Infinity
  const values = samples.map(([, y]) => y).concat([0])
  values.forEach((y) => {
    if (y < lo) lo = y
    if (y > hi) hi = y
  })
  const span = Math.max(1, hi - lo)
  const yDom = [Math.floor(lo - span * 0.12), Math.ceil(hi + span * 0.12)]

  const slope = df(a)
  const yAt = f(a)
  const tangentY = (x) => yAt + slope * (x - a)

  const onMove = (e) => {
    if (!dragging.current || !svgRef.current) return
    const x = dataXFromEvent(e, svgRef.current, geo)
    setA(Math.max(-1.4, Math.min(2.5, Math.round(x * 20) / 20)))
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <ChartShell
          svgRef={svgRef}
          xDomain={xDom}
          yDomain={yDom}
          xTicks={6}
          yTicks={5}
          xLabel="x"
          yLabel="f(x)"
          accent="#8b5cf6"
          sx={(x) => 44 + ((x - xDom[0]) / (xDom[1] - xDom[0])) * (640 - 62)}
          sy={(y) => 20 + (1 - (y - yDom[0]) / (yDom[1] - yDom[0])) * (380 - 54)}
        >
          {(sx, sy) => (
            <g
              onPointerDown={(e) => {
                dragging.current = true
                e.currentTarget.setPointerCapture?.(e.pointerId)
                onMove(e)
              }}
              onPointerMove={onMove}
              onPointerUp={() => (dragging.current = false)}
              onPointerLeave={() => (dragging.current = false)}
              style={{ cursor: 'ew-resize' }}
            >
              <rect x={44} y={20} width={578} height={326} fill="transparent" />
              <path
                d={samples.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.6"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,.45))' }}
              />
              {/* tangent */}
              <line
                x1={sx(xDom[0])}
                y1={sy(tangentY(xDom[0]))}
                x2={sx(xDom[1])}
                y2={sy(tangentY(xDom[1]))}
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeDasharray="7 5"
              />
              {/* slope triangle */}
              <line x1={sx(a)} y1={sy(yAt)} x2={sx(a + 1)} y2={sy(yAt)} stroke="#06b6d4" strokeOpacity=".6" strokeDasharray="3 3" />
              <line x1={sx(a + 1)} y1={sy(yAt)} x2={sx(a + 1)} y2={sy(yAt + slope)} stroke="#06b6d4" strokeOpacity=".6" strokeDasharray="3 3" />
              <line x1={sx(a)} y1={sy(yAt)} x2={sx(a)} y2={sy(yAt + slope)} stroke="#06b6d4" strokeOpacity=".25" />
              <AxisTag x={sx(a + 0.5)} y={sy(yAt) - 4} color="#06b6d4">
                Δx = 1
              </AxisTag>
              <AxisTag x={sx(a + 1) + 4} y={sy(yAt + slope / 2) + 4} color="#06b6d4" anchor="start">
                Δy = {Number(slope.toFixed(2))}
              </AxisTag>
              {/* vertical drop */}
              <line x1={sx(a)} y1={sy(yAt)} x2={sx(a)} y2={sy(0)} stroke="rgba(148,163,184,0.35)" strokeDasharray="3 4" />
              <line x1={sx(a)} y1={sy(0)} x2={sx(0)} y2={sy(0)} stroke="rgba(148,163,184,0.2)" strokeDasharray="3 4" />
              {/* point */}
              <circle cx={sx(a)} cy={sy(yAt)} r="10" fill="#f59e0b" opacity="0.18" />
              <circle cx={sx(a)} cy={sy(yAt)} r="5" fill="#0b1120" stroke="#f59e0b" strokeWidth="2.4" />
              <AxisTag x={sx(a)} y={sy(yAt) - 18} color="#f59e0b">
                slope = {Number(slope.toFixed(2))}
              </AxisTag>
              <AxisTag x={sx(a)} y={sy(0) - 8} color="#94a3b8">
                x = {a.toFixed(2)}
              </AxisTag>
            </g>
          )}
        </ChartShell>
        <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-obsidian/80 px-2 py-1 font-mono text-[10px] text-slate-400">
          drag the amber point
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-[11px] text-slate-500">x = {a.toFixed(2)}</span>
            <input
              type="range"
              min="-1.3"
              max="2.5"
              step="0.05"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full"
              aria-label="Evaluation point x"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[-1, 0, 1, 2].map((v) => (
              <button
                key={v}
                onClick={() => setA(v)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition ${
                  Math.abs(a - v) < 0.001
                    ? 'border-violet/40 bg-violet/15 text-violet-soft'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                x = {v}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'f(a)', v: yAt.toFixed(2), c: 'text-violet-soft' },
              { k: "f'(a)", v: slope.toFixed(2), c: 'text-amber' },
              { k: 'tangent', v: `y = ${slope}x ${yAt - slope * a >= 0 ? '+' : '−'} ${Math.abs(yAt - slope * a).toFixed(2)}`, c: 'text-cyan' },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">{s.k}</p>
                <p className={`mt-0.5 truncate font-mono text-[12px] font-semibold ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
