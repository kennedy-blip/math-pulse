import { useRef, useState } from 'react'
import ChartShell, { AxisTag, dataXFromEvent } from './ChartShell'

function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804 * Math.exp((-z * z) / 2)
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const p = 1 - d * poly
  return z >= 0 ? p : 1 - p
}

export default function BellDiagram({ compact = false }) {
  const [mu, setMu] = useState(500)
  const [sigma, setSigma] = useState(100)
  const [threshold, setThreshold] = useState(650)
  const svgRef = useRef(null)
  const dragging = useRef(false)

  const xDom = [mu - 4 * sigma, mu + 4 * sigma]
  const pdf = (x) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
  const peak = pdf(mu)
  const yDom = [0, peak * 1.32]
  const z = (threshold - mu) / sigma
  const left = normCdf(z)
  const tail = 1 - left

  const sx = (x) => 44 + ((x - xDom[0]) / (xDom[1] - xDom[0])) * 578
  const sy = (y) => 20 + (1 - (y - yDom[0]) / (yDom[1] - yDom[0])) * 326

  const N = 180
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const x = xDom[0] + (i / N) * (xDom[1] - xDom[0])
    return [x, pdf(x)]
  })
  const tailPts = pts.filter(([x]) => x >= threshold)

  const onMove = (e) => {
    if (!dragging.current || !svgRef.current) return
    const x = dataXFromEvent(e, svgRef.current, {
      width: 640,
      pad: { l: 44, r: 18, t: 20, b: 34 },
      xDomain: xDom,
    })
    setThreshold(Math.round(Math.max(xDom[0] + 0.05 * sigma, Math.min(xDom[1] - 0.05 * sigma, x)) / 5) * 5)
  }

  const tickMarks = [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ x: mu + k * sigma, k }))

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]/70">
        <ChartShell
          svgRef={svgRef}
          xDomain={xDom}
          yDomain={yDom}
          xTicks={0}
          yTicks={0}
          xLabel="score"
          yLabel="density"
          accent="#f59e0b"
          sx={sx}
          sy={sy}
        >
          {(sx, sy) => (
            <g>
              <defs>
                <linearGradient id="bell-tail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="bell-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* body fill */}
              <path
                d={`M${sx(xDom[0])},${sy(0)} ${pts.map(([x, y]) => `L${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} L${sx(xDom[1])},${sy(0)} Z`}
                fill="url(#bell-body)"
              />
              {/* shaded tail */}
              {tailPts.length > 1 && (
                <path
                  d={`M${sx(tailPts[0][0])},${sy(0)} ${tailPts
                    .map(([x, y]) => `L${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
                    .join(' ')} L${sx(tailPts[tailPts.length - 1][0])},${sy(0)} Z`}
                  fill="url(#bell-tail)"
                />
              )}

              {/* curve */}
              <path
                d={pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.4"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,.4))' }}
              />

              {/* sd ticks */}
              {tickMarks.map(({ x, k }) => (
                <g key={k}>
                  <line x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(0) + 6} stroke="rgba(148,163,184,.45)" strokeWidth="1" />
                  <text
                    x={sx(x)}
                    y={sy(0) + 19}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="9.5"
                    fill={k === 0 ? '#f59e0b' : '#64748b'}
                  >
                    {k === 0 ? `μ ${mu}` : `${k > 0 ? '+' : ''}${k}σ`}
                  </text>
                </g>
              ))}

              {/* threshold */}
              <line x1={sx(threshold)} y1={sy(0)} x2={sx(threshold)} y2={sy(pdf(threshold)) + 6} stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="5 4" />
              <circle cx={sx(threshold)} cy={sy(0)} r="4" fill="#f43f5e" />
              <AxisTag x={sx(threshold)} y={sy(pdf(threshold)) - 12} color="#f43f5e">
                x₀ = {threshold}
              </AxisTag>
              <AxisTag x={(sx(threshold) + sx(xDom[1])) / 2} y={sy(peak * 0.34)} color="#f43f5e">
                {(tail * 100).toFixed(1)}%
              </AxisTag>

              {/* mean */}
              <line x1={sx(mu)} y1={sy(0)} x2={sx(mu)} y2={sy(peak)} stroke="rgba(245,158,11,.5)" strokeWidth="1.4" />
              <AxisTag x={sx(mu)} y={sy(peak) - 12} color="#f59e0b">
                μ = {mu}
              </AxisTag>

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
              </g>
            </g>
          )}
        </ChartShell>
        <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-obsidian/85 px-2 py-1 font-mono text-[10px] text-slate-400">
          drag the threshold
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[11px] text-slate-500">σ = {sigma}</span>
            <input
              type="range"
              min="50"
              max="150"
              step="10"
              value={sigma}
              onChange={(e) => {
                const s = Number(e.target.value)
                setSigma(s)
                setThreshold(Math.max(mu - 3 * s, Math.min(mu + 3 * s, threshold)))
              }}
              className="w-full"
              aria-label="Standard deviation"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[11px] text-slate-500">μ = {mu}</span>
            <input
              type="range"
              min="400"
              max="600"
              step="25"
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full"
              aria-label="Mean"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[11px] text-slate-500">x₀ = {threshold}</span>
            <input
              type="range"
              min={Math.round(xDom[0])}
              max={Math.round(xDom[1])}
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
              aria-label="Threshold"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">z-score</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-cyan">{z.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Φ(z)</p>
              <p className="mt-0.5 font-mono text-[12px] text-slate-200">{left.toFixed(4)}</p>
            </div>
            <div className="rounded-lg border border-rose/20 bg-rose/[0.06] px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">P(X &gt; x₀)</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-rose">{tail.toFixed(4)}</p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            {Math.abs(z) < 0.01
              ? 'The threshold sits at the mean, so half the distribution lies above it.'
              : `${threshold} is ${Math.abs(z).toFixed(2)} standard deviations ${z > 0 ? 'above' : 'below'} the mean.`}{' '}
            Use 1 − Φ(z) for right tails.
          </p>
        </div>
      )}
    </div>
  )
}
