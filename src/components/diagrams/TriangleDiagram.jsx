import { useState } from 'react'

const ANG = { A: 40, B: 60, C: 80 }

/* Construct a triangle with those angles using the sine rule, AB = 1 */
const AB = 1
const AC = (Math.sin((ANG.B * Math.PI) / 180) / Math.sin((ANG.C * Math.PI) / 180)) * AB
const RAW = {
  A: { x: 0, y: 0 },
  B: { x: AB, y: 0 },
  C: { x: AC * Math.cos((ANG.A * Math.PI) / 180), y: AC * Math.sin((ANG.A * Math.PI) / 180) },
}

const W = 640
const H = 380
const PAD = 62
const minX = Math.min(RAW.A.x, RAW.B.x, RAW.C.x)
const maxX = Math.max(RAW.A.x, RAW.B.x, RAW.C.x)
const minY = Math.min(RAW.A.y, RAW.B.y, RAW.C.y)
const maxY = Math.max(RAW.A.y, RAW.B.y, RAW.C.y)
const scale = Math.min((W - PAD * 2) / (maxX - minX), (H - PAD * 1.6) / (maxY - minY))
const offX = (W - (maxX - minX) * scale) / 2
const offY = (H + (maxY - minY) * scale) / 2
const P = {
  A: { x: offX + (RAW.A.x - minX) * scale, y: offY - (RAW.A.y - minY) * scale },
  B: { x: offX + (RAW.B.x - minX) * scale, y: offY - (RAW.B.y - minY) * scale },
  C: { x: offX + (RAW.C.x - minX) * scale, y: offY - (RAW.C.y - minY) * scale },
}
const centroid = {
  x: (P.A.x + P.B.x + P.C.x) / 3,
  y: (P.A.y + P.B.y + P.C.y) / 3,
}

const angleOf = (from, to) => (Math.atan2(-(to.y - from.y), to.x - from.x) * 180) / Math.PI

const arcPath = (vertex, to1, to2, radius) => {
  const a1 = angleOf(vertex, to1)
  let a2 = angleOf(vertex, to2)
  let diff = ((a2 - a1 + 540) % 360) - 180
  const start = a1
  const end = a1 + diff
  const pt = (deg, r) => ({
    x: vertex.x + r * Math.cos((deg * Math.PI) / 180),
    y: vertex.y - r * Math.sin((deg * Math.PI) / 180),
  })
  const s = pt(start, radius)
  const e = pt(end, radius)
  return {
    d: `M${s.x.toFixed(1)},${s.y.toFixed(1)} A${radius},${radius} 0 0 ${diff > 0 ? 1 : 0} ${e.x.toFixed(1)},${e.y.toFixed(1)}`,
    mid: pt(start + diff / 2, radius + 22),
  }
}

const SIDES = [
  { id: 'AB', from: 'A', to: 'B', opposite: 'C' },
  { id: 'BC', from: 'B', to: 'C', opposite: 'A' },
  { id: 'CA', from: 'C', to: 'A', opposite: 'B' },
]

export default function TriangleDiagram({ compact = false }) {
  const [selected, setSelected] = useState(null)

  const arcs = {
    A: arcPath(P.A, P.B, P.C, 52),
    B: arcPath(P.B, P.A, P.C, 44),
    C: arcPath(P.C, P.A, P.B, 40),
  }
  const colors = { A: '#06b6d4', B: '#8b5cf6', C: '#f59e0b' }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" role="img" aria-label="Triangle with 40, 60 and 80 degree angles">
          <defs>
            <linearGradient id="tri-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.07" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={W} height={H} rx="12" fill="rgba(7,12,24,0.35)" />
          {/* faint grid */}
          <g opacity="0.35">
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`v${i}`} x1={i * 46} x2={i * 46} y1="0" y2={H} stroke="rgba(148,163,184,0.07)" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`h${i}`} x1="0" x2={W} y1={i * 46} y2={i * 46} stroke="rgba(148,163,184,0.07)" />
            ))}
          </g>

          <polygon
            points={`${P.A.x},${P.A.y} ${P.B.x},${P.B.y} ${P.C.x},${P.C.y}`}
            fill="url(#tri-fill)"
            stroke="none"
          />

          {/* angle sectors */}
          {Object.entries(arcs).map(([v, arc]) => (
            <g key={v}>
              <path
                d={arc.d}
                fill="none"
                stroke={colors[v]}
                strokeWidth={selected === v ? 3 : 1.7}
                strokeOpacity={selected && selected !== v ? 0.28 : 0.95}
                style={selected === v ? { filter: `drop-shadow(0 0 6px ${colors[v]})` } : undefined}
              />
            </g>
          ))}

          {/* sides */}
          {SIDES.map((s) => {
            const a = P[s.from]
            const b = P[s.to]
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
            const outward = { x: mid.x - centroid.x, y: mid.y - centroid.y }
            const len = Math.hypot(outward.x, outward.y) || 1
            const lx = mid.x + (outward.x / len) * 26
            const ly = mid.y + (outward.y / len) * 26
            const active = selected && selected !== s.opposite
            return (
              <g key={s.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={selected && selected === s.opposite ? colors[s.opposite] : 'rgba(226,232,240,0.85)'}
                  strokeWidth={selected === s.opposite ? 3.4 : 2.2}
                  strokeOpacity={active ? 0.6 : 1}
                  strokeLinecap="round"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="10"
                  fill={selected === s.opposite ? colors[s.opposite] : '#94a3b8'}
                  opacity={active ? 0.5 : 1}
                >
                  ∝ sin {ANG[s.opposite]}°
                </text>
              </g>
            )
          })}

          {/* angle labels */}
          {Object.entries(arcs).map(([v, arc]) => (
            <text
              key={`lbl-${v}`}
              x={arc.mid.x}
              y={arc.mid.y}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="13"
              fontWeight="700"
              fill={colors[v]}
              opacity={selected && selected !== v ? 0.4 : 1}
            >
              {ANG[v]}°
            </text>
          ))}

          {/* vertices */}
          {Object.entries(P).map(([v, p]) => {
            const outward = { x: p.x - centroid.x, y: p.y - centroid.y }
            const len = Math.hypot(outward.x, outward.y) || 1
            const lx = p.x + (outward.x / len) * 26
            const ly = p.y + (outward.y / len) * 26 + 5
            return (
              <g key={v} onMouseEnter={() => setSelected(v)} onMouseLeave={() => setSelected(null)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                <circle cx={p.x} cy={p.y} r="5" fill="#0b1120" stroke={colors[v]} strokeWidth="2.4" />
                <circle cx={p.x} cy={p.y} r="1.8" fill={colors[v]} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="15"
                  fontWeight="700"
                  fill={selected === v ? colors[v] : '#e2e8f0'}
                >
                  {v}
                </text>
              </g>
            )
          })}

          <g>
            <rect x={W - 232} y={16} width={214} height={46} rx="8" fill="rgba(7,12,24,0.88)" stroke="rgba(255,255,255,0.1)" />
            <text x={W - 220} y={36} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e2e8f0">
              A + B + C = 180°
            </text>
            <text x={W - 220} y={52} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#64748b">
              40° + 60° + 80° = 180° ✓
            </text>
          </g>
        </svg>
        <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-obsidian/85 px-2 py-1 font-mono text-[10px] text-slate-400">
          ratio 2 : 3 : 4
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {['A', 'B', 'C'].map((v) => (
              <button
                key={v}
                onClick={() => setSelected(selected === v ? null : v)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold transition ${
                  selected === v
                    ? `bg-white/[0.07]`
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
                style={
                  selected === v
                    ? { borderColor: `${colors[v]}66`, color: colors[v], backgroundColor: `${colors[v]}14` }
                    : undefined
                }
              >
                ∠{v} = {ANG[v]}°
              </button>
            ))}
            <span className="ml-auto rounded-lg border border-emerald/30 bg-emerald/10 px-2.5 py-1 font-mono text-[11px] text-emerald">
              acute · scalene
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Total parts</p>
              <p className="mt-0.5 font-mono text-[12px] text-cyan">2 + 3 + 4 = 9</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Scale k</p>
              <p className="mt-0.5 font-mono text-[12px] text-violet-soft">180° ÷ 9 = 20°</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Largest angle</p>
              <p className="mt-0.5 font-mono text-[12px] text-amber">80° (vertex C)</p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Hover a vertex to isolate its angle; the highlighted side sits opposite the selected angle and scales with its sine.
          </p>
        </div>
      )}
    </div>
  )
}
