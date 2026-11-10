import { useId } from 'react'

export const scaleLinear = (d0, d1, r0, r1) => {
  const m = (r1 - r0) / (d1 - d0 || 1)
  return (v) => r0 + (v - d0) * m
}

export function ticks(min, max, count) {
  if (!count || count <= 0 || !isFinite(min) || !isFinite(max)) return []
  const raw = (max - min) / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw
  const start = Math.ceil(min / step) * step
  const out = []
  for (let v = start; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(6)))
  return out
}

export function dataXFromEvent(e, svgEl, { width, pad, xDomain }) {
  const rect = svgEl.getBoundingClientRect()
  const vbX = ((e.clientX - rect.left) / rect.width) * width
  const inner = width - pad.l - pad.r
  return xDomain[0] + ((vbX - pad.l) / inner) * (xDomain[1] - xDomain[0])
}

const fmt = (v) => {
  const n = Math.abs(v) >= 100 ? Math.round(v) : Math.abs(v) >= 10 ? Number(v.toFixed(1)) : Number(v.toFixed(2))
  return String(n)
}

export default function ChartShell({
  xDomain,
  yDomain,
  xTicks = 6,
  yTicks = 5,
  xLabel,
  yLabel,
  width = 640,
  height = 380,
  pad = { l: 44, r: 18, t: 20, b: 34 },
  sx: sxProp,
  sy: syProp,
  children,
  accent = '#8b5cf6',
  gridColor = 'rgba(148,163,184,0.10)',
  axisInside = true,
  rounded = 12,
  className = '',
  svgRef,
}) {
  const uid = useId().replace(/[:]/g, '')
  const plotW = width - pad.l - pad.r
  const plotH = height - pad.t - pad.b
  const sx = sxProp || scaleLinear(xDomain[0], xDomain[1], pad.l, pad.l + plotW)
  const sy = syProp || scaleLinear(yDomain[0], yDomain[1], pad.t + plotH, pad.t)

  const xt = ticks(xDomain[0], xDomain[1], xTicks)
  const yt = ticks(yDomain[0], yDomain[1], yTicks)
  const x0 = Math.max(pad.l, Math.min(pad.l + plotW, sx(0)))
  const y0 = Math.max(pad.t, Math.min(pad.t + plotH, sy(0)))
  const showXAxis = axisInside && 0 >= yDomain[0] && 0 <= yDomain[1]
  const showYAxis = axisInside && 0 >= xDomain[0] && 0 <= xDomain[1]
  const xLabelPos = xLabel === 'right'

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full touch-none select-none ${className}`}
      role="img"
      aria-label={`${yLabel || 'Function'} versus ${xLabel || 'x'} chart`}
    >
      <defs>
        <clipPath id={`plot-${uid}`}>
          <rect x={pad.l} y={pad.t} width={plotW} height={plotH} rx={8} />
        </clipPath>
        <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x={pad.l}
        y={pad.t}
        width={plotW}
        height={plotH}
        rx={8}
        fill="rgba(7,12,24,0.55)"
        stroke="rgba(255,255,255,0.07)"
      />

      {/* grid */}
      <g clipPath={`url(#plot-${uid})`}>
        {xt.map((t) => (
          <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={pad.t} y2={pad.t + plotH} stroke={gridColor} strokeWidth="1" />
        ))}
        {yt.map((t) => (
          <line key={`gy${t}`} x1={pad.l} x2={pad.l + plotW} y1={sy(t)} y2={sy(t)} stroke={gridColor} strokeWidth="1" />
        ))}
        {showXAxis && (
          <line x1={pad.l} x2={pad.l + plotW} y1={y0} y2={y0} stroke="rgba(148,163,184,0.35)" strokeWidth="1.2" />
        )}
        {showYAxis && (
          <line x1={x0} x2={x0} y1={pad.t} y2={pad.t + plotH} stroke="rgba(148,163,184,0.35)" strokeWidth="1.2" />
        )}
      </g>

      {/* clue text */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#64748b">
        {xt.map((t) => (
          <text key={`tx${t}`} x={sx(t)} y={pad.t + plotH + 15} textAnchor="middle">
            {fmt(t)}
          </text>
        ))}
        {yt.map((t) => (
          <text key={`ty${t}`} x={pad.l - 8} y={sy(t) + 3} textAnchor="end">
            {fmt(t)}
          </text>
        ))}
      </g>

      <g clipPath={`url(#plot-${uid})`}>{children?.(sx, sy, { pad, plotW, plotH, width, height, x0, y0, accent })}</g>

      {yLabel && (
        <text
          x={pad.l + plotW}
          y={pad.t - 7}
          textAnchor="end"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fill="#94a3b8"
        >
          {yLabel}
        </text>
      )}
      {xLabel && (
        <text
          x={xLabelPos ? pad.l + plotW - 2 : pad.l + plotW}
          y={height - 6}
          textAnchor="end"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fill="#94a3b8"
        >
          {xLabel}
        </text>
      )}
    </svg>
  )
}

/* shared axis-tag chip rendered inside the svg */
export function AxisTag({ x, y, children, color = '#94a3b8', anchor = 'middle', size = 10.5 }) {
  const w = String(children).length * size * 0.62 + 12
  return (
    <g>
      <rect
        x={x - (anchor === 'middle' ? w / 2 : anchor === 'end' ? w : 0)}
        y={y - size - 3}
        width={w}
        height={size + 9}
        rx={5}
        fill="rgba(7,12,24,0.88)"
        stroke={color}
        strokeOpacity="0.35"
      />
      <text
        x={x}
        y={y + 1}
        textAnchor={anchor}
        fontFamily="JetBrains Mono, monospace"
        fontSize={size}
        fill={color}
        fontWeight="600"
      >
        {children}
      </text>
    </g>
  )
}
