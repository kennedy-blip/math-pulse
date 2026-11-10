import { useId, useMemo, useState } from 'react'
import ChartShell, { AxisTag } from './ChartShell'
import { functionModel } from '../../lib/classify.js'

const FALLBACK = {
  f: (x) => 3 * x * x + 2 * x,
  F: (x) => x * x * x + x * x,
}

export default function AreaDiagram({ compact = false, expr, bounds }) {
  const model = useMemo(() => functionModel(expr), [expr])
  const f = model?.f || FALLBACK.f
  const F = model?.F || FALLBACK.F
  const a = Number.isFinite(bounds?.[0]) ? bounds[0] : 0
  const b0 = Number.isFinite(bounds?.[1]) ? bounds[1] : 2
  const [b, setB] = useState(b0)
  const [n, setN] = useState(8)
  const areaGrad = `area-grad-${useId().replace(/[:]/g, '')}`

  const X_MAX = Math.max(b0 * 1.3, 1)
  let peak = 0
  for (let i = 0; i <= 60; i += 1) peak = Math.max(peak, f(a + (i / 60) * (X_MAX - a)))
  const Y_MAX = Math.max(4, peak * 1.18)
  const xDom = [0, X_MAX]
  const yDom = [0, Y_MAX]
  const samples = Array.from({ length: 140 }, (_, i) => {
    const x = a + (i / 139) * (b - a)
    return [x, f(x)]
  })

  const rects = Array.from({ length: n }, (_, i) => {
    const w = (b - a) / n
    const x = a + i * w
    const h = f(x)
    return { x, w, h }
  })
  const riemann = rects.reduce((sum, r) => sum + r.w * r.h, 0)
  const exact = F(b) - F(a)

  const sx = (x) => 44 + (x / X_MAX) * (640 - 62)
  const sy = (y) => 20 + (1 - y / Y_MAX) * (380 - 54)

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <ChartShell
          xDomain={xDom}
          yDomain={yDom}
          xTicks={6}
          yTicks={5}
          xLabel="x"
          yLabel="y"
          accent="#8b5cf6"
          sx={sx}
          sy={sy}
        >
          {(sx, sy) => (
            <g>
              {/* shaded area */}
              <path
                d={`M${sx(a)},${sy(0)} ${samples.map(([x, y]) => `L${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} L${sx(b)},${sy(0)} Z`}
                fill={`url(#${areaGrad})`}
                stroke="none"
              />
              <defs>
                <linearGradient id={areaGrad} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Riemann rectangles */}
              {rects.map((r, i) => (
                <rect
                  key={i}
                  x={sx(r.x)}
                  y={sy(r.h)}
                  width={sx(r.x + r.w) - sx(r.x)}
                  height={sy(0) - sy(r.h)}
                  fill="rgba(6,182,212,0.055)"
                  stroke="rgba(6,182,212,0.55)"
                  strokeWidth="0.9"
                />
              ))}

              {/* curve */}
              <path
                d={samples.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.6"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,.5))' }}
              />
              <line x1={sx(b)} y1={sy(0)} x2={sx(b)} y2={sy(f(b))} stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="4 4" />
              <circle cx={sx(b)} cy={sy(f(b))} r="4.5" fill="#0b1120" stroke="#f59e0b" strokeWidth="2.2" />
              <AxisTag x={sx(b)} y={sy(f(b)) - 14} color="#f59e0b">
                x = {b.toFixed(1)}
              </AxisTag>
              <AxisTag x={sx(a + (b - a) / 2)} y={sy(f(b) / 2) + 16} color="#06b6d4">
                area = {exact.toFixed(2)}
              </AxisTag>
            </g>
          )}
        </ChartShell>
        <div className="pointer-events-none absolute right-2.5 top-2.5 rounded-md border border-white/10 bg-obsidian/80 px-2 py-1 font-mono text-[10px] text-slate-400">
          n = {n} rectangles
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-[11px] text-slate-500">b = {b.toFixed(1)}</span>
            <input
              type="range"
              min={a + 0.1}
              max={Math.max(X_MAX * 0.98, b0)}
              step="0.1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full"
              aria-label="Upper bound b"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] uppercase tracking-wider text-slate-500">Rectangles</span>
            {[0, 1, 2, 4, 8, 16, 32, 64].map((v) => (
              <button
                key={v}
                onClick={() => setN(v)}
                className={`min-w-[28px] rounded-md border px-1.5 py-1 font-mono text-[10.5px] transition ${
                  n === v
                    ? 'border-cyan/40 bg-cyan/15 text-cyan'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Exact area</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-violet-soft">{exact.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Riemann</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-cyan">{riemann.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Gap</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-amber">
                {(exact - riemann).toFixed(3)}
              </p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Left-endpoint rectangles converge to the signed area as n → ∞; the gap reports the truncation error.
          </p>
        </div>
      )}
    </div>
  )
}
