import { useState } from 'react'
import ChartShell, { AxisTag } from './ChartShell'

const X_DOM = [-1.2, 7.2]
const Y_DOM = [-1.2, 7.2]

export default function LinearDiagram({ compact = false }) {
  const [showNormals, setShowNormals] = useState(true)
  const [showCandidate, setShowCandidate] = useState(false)

  const sx = (v) => 44 + ((v - X_DOM[0]) / (X_DOM[1] - X_DOM[0])) * 578
  const sy = (v) => 20 + (1 - (v - Y_DOM[0]) / (Y_DOM[1] - Y_DOM[0])) * 326

  const line1 = (x) => (12 - 2 * x) / 3
  const line2 = (x) => x - 1
  const cx = 3
  const cy = 2

  // normalised normals from the solution point
  const n1 = [2, 3]
  const n2 = [1, -1]
  const scale = 1.05
  const arrow = (v) => {
    const m = Math.hypot(v[0], v[1])
    return [(v[0] / m) * scale, (v[1] / m) * scale]
  }
  const [a1x, a1y] = arrow(n1)
  const [a2x, a2y] = arrow(n2)

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <ChartShell
          xDomain={X_DOM}
          yDomain={Y_DOM}
          xTicks={8}
          yTicks={8}
          xLabel="x"
          yLabel="y"
          accent="#10b981"
          sx={sx}
          sy={sy}
        >
          {(sx, sy) => (
            <g>
              <defs>
                <marker id="arrow-linear-a" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill="#f59e0b" />
                </marker>
                <marker id="arrow-linear-b" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill="#06b6d4" />
                </marker>
              </defs>

              {/* candidate residuals */}
              {showCandidate && (
                <g opacity="0.85">
                  <circle cx={sx(1.2)} cy={sy(1.9)} r="5" fill="#f43f5e" />
                  <AxisTag x={sx(1.2)} y={sy(1.9) + 20} color="#f43f5e">
                    candidate
                  </AxisTag>
                </g>
              )}

              {/* line 1: 2x + 3y = 12 */}
              <line x1={sx(X_DOM[0])} y1={sy(line1(X_DOM[0]))} x2={sx(X_DOM[1])} y2={sy(line1(X_DOM[1]))} stroke="#8b5cf6" strokeWidth="2.4" />
              {/* line 2: x - y = 1 */}
              <line x1={sx(X_DOM[0])} y1={sy(line2(X_DOM[0]))} x2={sx(X_DOM[1])} y2={sy(line2(X_DOM[1]))} stroke="#06b6d4" strokeWidth="2.4" />

              <AxisTag x={sx(5.4)} y={sy(line1(5.4)) - 12} color="#8b5cf6">
                2x + 3y = 12
              </AxisTag>
              <AxisTag x={sx(5.7)} y={sy(line2(5.7)) + 20} color="#06b6d4">
                x − y = 1
              </AxisTag>

              {/* normals */}
              {showNormals && (
                <>
                  <line x1={sx(cx)} y1={sy(cy)} x2={sx(cx + a1x)} y2={sy(cy + a1y)} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-linear-a)" />
                  <line x1={sx(cx)} y1={sy(cy)} x2={sx(cx + a2x)} y2={sy(cy + a2y)} stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-linear-b)" />
                  <AxisTag x={sx(cx + a1x) + 10} y={sy(cy + a1y) - 4} color="#f59e0b" anchor="start">
                    n₁
                  </AxisTag>
                  <AxisTag x={sx(cx + a2x) + 10} y={sy(cy + a2y) + 12} color="#06b6d4" anchor="start">
                    n₂
                  </AxisTag>
                </>
              )}

              {/* intersection */}
              <circle cx={sx(cx)} cy={sy(cy)} r="15" fill="#10b981" opacity="0.13" />
              <circle cx={sx(cx)} cy={sy(cy)} r="6" fill="#10b981" stroke="#03140f" strokeWidth="2" />
              <AxisTag x={sx(cx)} y={sy(cy) - 20} color="#10b981">
                (3, 2)
              </AxisTag>
            </g>
          )}
        </ChartShell>
        <div className="pointer-events-none absolute right-2.5 top-2.5 rounded-md border border-emerald/20 bg-obsidian/85 px-2 py-1 font-mono text-[10px] text-emerald">
          unique solution
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNormals((s) => !s)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                showNormals
                  ? 'border-amber/40 bg-amber/10 text-amber'
                  : 'border-white/10 bg-white/[0.03] text-slate-400'
              }`}
            >
              Normal vectors
            </button>
            <button
              onClick={() => setShowCandidate((s) => !s)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                showCandidate
                  ? 'border-rose/40 bg-rose/10 text-rose'
                  : 'border-white/10 bg-white/[0.03] text-slate-400'
              }`}
            >
              Off-solution probe
            </button>
            <span className="ml-auto rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-400">
              det A = −5
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'Eq. 1 slope', v: '−2/3', c: 'text-violet-soft' },
              { k: 'Eq. 2 slope', v: '1', c: 'text-cyan' },
              { k: 'Intersection', v: '(3, 2)', c: 'text-emerald' },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">{s.k}</p>
                <p className={`mt-0.5 font-mono text-[12px] font-semibold ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Different slopes guarantee a single crossing; the normals are not parallel, so the determinant is non-zero.
          </p>
        </div>
      )}
    </div>
  )
}
