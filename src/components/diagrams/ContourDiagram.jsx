import { useRef, useState } from 'react'
import ChartShell, { AxisTag, dataXFromEvent } from './ChartShell'

const X_DOM = [0.3, 6.6]
const Y_DOM = [0.1, 6.8]
const LEVELS = [1.5, 4, 8, 14, 22, 32, 44, 58, 76]

export default function ContourDiagram({ compact = false }) {
  const [x, setX] = useState(3)
  const [showGrad, setShowGrad] = useState(true)
  const svgRef = useRef(null)
  const dragging = useRef(false)

  const y = 6 - x
  const value = x * x * y
  const gradF = [2 * x * y, x * x]
  const norm = Math.hypot(...gradF) || 1
  const gx = (gradF[0] / norm) * 1.05
  const gy = (gradF[1] / norm) * 1.05
  const optimal = Math.abs(x - 4) < 0.08
  const sx = (v) => 44 + ((v - X_DOM[0]) / (X_DOM[1] - X_DOM[0])) * 578
  const sy = (v) => 20 + (1 - (v - Y_DOM[0]) / (Y_DOM[1] - Y_DOM[0])) * 326

  const onMove = (e) => {
    if (!dragging.current || !svgRef.current) return
    const nx = dataXFromEvent(e, svgRef.current, {
      width: 640,
      pad: { l: 44, r: 18, t: 20, b: 34 },
      xDomain: X_DOM,
    })
    setX(Math.max(0.3, Math.min(5.7, Math.round(nx * 20) / 20)))
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <ChartShell
          svgRef={svgRef}
          xDomain={X_DOM}
          yDomain={Y_DOM}
          xTicks={7}
          yTicks={7}
          xLabel="x"
          yLabel="y"
          accent="#06b6d4"
          sx={sx}
          sy={sy}
        >
          {(sx, sy) => (
            <g>
              {/* level curves x²y = c  =>  y = c/x² */}
              {LEVELS.map((c) => {
                const xStart = Math.max(0.35, Math.sqrt(c / 6.6))
                const xEnd = Math.min(6.5, Math.sqrt(c / 0.25))
                const pts = []
                for (let i = 0; i <= 60; i++) {
                  const xx = xStart + (i / 60) * (xEnd - xStart)
                  const yy = c / (xx * xx)
                  if (yy >= Y_DOM[0] && yy <= Y_DOM[1]) pts.push([xx, yy])
                }
                if (pts.length < 2) return null
                const isOpt = c === 32
                return (
                  <path
                    key={c}
                    d={pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${sx(px).toFixed(1)},${sy(py).toFixed(1)}`).join(' ')}
                    fill="none"
                    stroke={isOpt ? '#f59e0b' : '#06b6d4'}
                    strokeOpacity={isOpt ? 0.95 : 0.3}
                    strokeWidth={isOpt ? 2 : 1.1}
                    strokeDasharray={isOpt ? 'none' : '0'}
                  />
                )
              })}

              {/* constraint line x + y = 6 */}
              <line x1={sx(0)} y1={sy(6)} x2={sx(6)} y2={sy(0)} stroke="#8b5cf6" strokeWidth="2.4" />
              <AxisTag x={sx(1.1)} y={sy(4.9)} color="#8b5cf6">
                x + y = 6
              </AxisTag>

              {/* optimal point */}
              <circle cx={sx(4)} cy={sy(2)} r="12" fill="#10b981" opacity="0.12" />
              <circle cx={sx(4)} cy={sy(2)} r="4" fill="#10b981" />
              <AxisTag x={sx(4) + 8} y={sy(2) + 18} color="#10b981" anchor="start">
                max f = 32
              </AxisTag>

              {/* gradient vectors at candidate */}
              {showGrad && (
                <>
                  <defs>
                    <marker id="arrow-amber" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 z" fill="#f59e0b" />
                    </marker>
                    <marker id="arrow-rose" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 z" fill="#f43f5e" />
                    </marker>
                  </defs>
                  <line
                    x1={sx(x)}
                    y1={sy(y)}
                    x2={sx(x + gx)}
                    y2={sy(y + gy)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    markerEnd="url(#arrow-amber)"
                  />
                  <line
                    x1={sx(x)}
                    y1={sy(y)}
                    x2={sx(x + 0.75)}
                    y2={sy(y + 0.75)}
                    stroke="#f43f5e"
                    strokeWidth="2"
                    markerEnd="url(#arrow-rose)"
                  />
                </>
              )}

              {/* candidate */}
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
                <circle cx={sx(x)} cy={sy(y)} r="14" fill="transparent" />
                <circle cx={sx(x)} cy={sy(y)} r="7" fill="#0b1120" stroke="#f59e0b" strokeWidth="2.6" />
                <circle cx={sx(x)} cy={sy(y)} r="2.4" fill="#f59e0b" />
              </g>
              <AxisTag x={sx(x)} y={sy(y) - 22} color={optimal ? '#10b981' : '#f59e0b'}>
                f = {value.toFixed(1)}
              </AxisTag>
            </g>
          )}
        </ChartShell>
        <div className="pointer-events-none absolute right-2.5 top-2.5 flex gap-1.5">
          <span className="rounded-md border border-amber/20 bg-obsidian/85 px-2 py-1 font-mono text-[10px] text-amber">
            ∇f
          </span>
          <span className="rounded-md border border-rose/20 bg-obsidian/85 px-2 py-1 font-mono text-[10px] text-rose">
            ∇g
          </span>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[11px] text-slate-500">
              x = {x.toFixed(2)}, y = {y.toFixed(2)}
            </span>
            <input
              type="range"
              min="0.3"
              max="5.7"
              step="0.02"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full"
              aria-label="Position along the constraint"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowGrad((s) => !s)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                showGrad
                  ? 'border-amber/40 bg-amber/10 text-amber'
                  : 'border-white/10 bg-white/[0.03] text-slate-400'
              }`}
            >
              Gradient vectors
            </button>
            <button
              onClick={() => setX(4)}
              className="rounded-lg border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-[11px] font-medium text-emerald transition hover:bg-emerald/15"
            >
              Jump to optimum (4, 2)
            </button>
            <span
              className={`ml-auto rounded-lg border px-2.5 py-1 font-mono text-[11px] ${
                optimal
                  ? 'border-emerald/40 bg-emerald/10 text-emerald'
                  : 'border-white/10 bg-white/[0.03] text-slate-500'
              }`}
            >
              {optimal ? 'gradients parallel ✓' : 'not yet tangent'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Candidate</p>
              <p className="mt-0.5 font-mono text-[12px] text-amber">
                ({x.toFixed(1)}, {y.toFixed(1)})
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">x²y</p>
              <p className={`mt-0.5 font-mono text-[12px] ${optimal ? 'text-emerald' : 'text-slate-200'}`}>
                {value.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">λ = −x²</p>
              <p className="mt-0.5 font-mono text-[12px] text-cyan">{(x * x).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
