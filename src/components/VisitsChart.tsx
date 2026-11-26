import { useMemo, useRef, useState } from 'react'
import type { DayPoint } from '../data/games'
import { formatCompact, formatNumber } from '../data/games'

interface VisitsChartProps {
  points: DayPoint[]
  color: string
  seriesLabel: string
}

// Hand-rolled SVG area chart — no chart library. Scales, gridlines, paths
// and the hover tooltip are all computed here from the data.
const W = 720
const H = 280
const PAD_L = 52
const PAD_R = 16
const PAD_T = 16
const PAD_B = 32
const TICKS = 4

function niceCeil(value: number): number {
  if (value <= 0) return 1000
  const step = value > 5000 ? 1000 : 500
  return Math.ceil(value / step) * step
}

export default function VisitsChart({ points, color, seriesLabel }: VisitsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const geom = useMemo(() => {
    const innerW = W - PAD_L - PAD_R
    const innerH = H - PAD_T - PAD_B
    const maxVisits = niceCeil(Math.max(...points.map((p) => p.visits)))
    const stepX = points.length > 1 ? innerW / (points.length - 1) : innerW

    const coords = points.map((p, i) => ({
      x: PAD_L + i * stepX,
      y: PAD_T + innerH - (p.visits / maxVisits) * innerH,
    }))

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
    const areaPath =
      `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(PAD_T + innerH).toFixed(1)} ` +
      `L${coords[0].x.toFixed(1)},${(PAD_T + innerH).toFixed(1)} Z`

    const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => {
      const v = (maxVisits / TICKS) * i
      return { value: v, y: PAD_T + innerH - (v / maxVisits) * innerH }
    })

    // ~5 x labels, always including first and last day
    const labelIdx = new Set<number>()
    const labelCount = Math.min(5, points.length)
    for (let i = 0; i < labelCount; i++) {
      labelIdx.add(Math.round((i * (points.length - 1)) / (labelCount - 1)))
    }

    return { coords, linePath, areaPath, yTicks, labelIdx, innerH }
  }, [points])

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current
    if (!svg || points.length === 0) return
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const innerW = W - PAD_L - PAD_R
    const stepX = points.length > 1 ? innerW / (points.length - 1) : innerW
    const idx = Math.round((x - PAD_L) / stepX)
    setHover(Math.max(0, Math.min(points.length - 1, idx)))
  }

  if (points.length === 0) return null

  const hoverPoint = hover !== null ? points[hover] : null
  const hoverCoord = hover !== null ? geom.coords[hover] : null
  const last = points[points.length - 1]
  const lastCoord = geom.coords[geom.coords.length - 1]

  // Tooltip placement: flip to the left side when hovering the right half.
  const tipW = 168
  const tipH = 52
  const tipX = hoverCoord ? Math.min(Math.max(hoverCoord.x - tipW / 2, PAD_L - 8), W - tipW - 4) : 0
  const tipY = hoverCoord ? Math.max(hoverCoord.y - tipH - 14, 2) : 0

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Daily visits chart for ${seriesLabel}`}
        onMouseLeave={() => setHover(null)}
      >
        {/* gridlines + y axis */}
        {geom.yTicks.map((t) => (
          <g key={t.value}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={t.y}
              y2={t.y}
              stroke="#1c1c1c"
              strokeOpacity={t.value === 0 ? 0.55 : 0.14}
              strokeDasharray={t.value === 0 ? '' : '4 5'}
              strokeWidth={t.value === 0 ? 2 : 1}
            />
            <text className="chart-axis" x={PAD_L - 8} y={t.y + 4} textAnchor="end">
              {formatCompact(t.value)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {points.map((p, i) =>
          geom.labelIdx.has(i) ? (
            <text
              key={p.date}
              className="chart-axis"
              x={geom.coords[i].x}
              y={H - 8}
              textAnchor="middle"
            >
              {p.label}
            </text>
          ) : null,
        )}

        {/* area + line */}
        <path d={geom.areaPath} fill={color} fillOpacity={0.35} />
        <path d={geom.linePath} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />

        {/* latest point */}
        <circle cx={lastCoord.x} cy={lastCoord.y} r={5.5} fill={color} stroke="#1c1c1c" strokeWidth={2} />

        {/* hover marker + tooltip */}
        {hoverPoint && hoverCoord && (
          <g>
            <line
              x1={hoverCoord.x}
              x2={hoverCoord.x}
              y1={PAD_T}
              y2={PAD_T + geom.innerH}
              stroke="#1c1c1c"
              strokeOpacity={0.4}
              strokeWidth={1.5}
            />
            <circle cx={hoverCoord.x} cy={hoverCoord.y} r={6} fill="#fff" stroke="#1c1c1c" strokeWidth={2.5} />
            <g transform={`translate(${tipX},${tipY})`}>
              <rect className="chart-tip-box" width={tipW} height={tipH} rx={8} />
              <text className="chart-tip-text" x={12} y={21}>
                {hoverPoint.label} · {formatNumber(hoverPoint.visits)} visits
              </text>
              <text className="chart-tip-text" x={12} y={41}>
                {hoverPoint.likePercent}% positive
              </text>
            </g>
          </g>
        )}

        {/* pointer capture */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={W - PAD_L - PAD_R}
          height={geom.innerH}
          fill="transparent"
          onMouseMove={handleMove}
        />
      </svg>
      <div className="chart-legend">
        <span>
          <span className="dot" style={{ background: color }} aria-hidden="true" />
          {seriesLabel} — daily visits
        </span>
        <span className="mono">latest day: {formatNumber(last.visits)} visits</span>
      </div>
    </div>
  )
}
