// Data layer for Remike Analytics.
//
// The headline stats (totalVisits, likePercent) are REAL numbers from the
// games' Roblox pages. The daily time series is SAMPLE data: it is generated
// deterministically below (seeded PRNG) so the dashboard has a plausible
// 30-day shape anchored to those real totals. It is labelled as sample data
// in the UI and in the README — it is not live Roblox API data.

export interface GameInfo {
  id: string
  name: string
  platform: string
  /** Real all-time visits from the game's Roblox page. */
  totalVisits: number
  /** Real all-time positive-like percentage from the game's Roblox page. */
  likePercent: number
  /** Accent colour used for this game's chart line and table chip. */
  color: string
}

export interface DayPoint {
  /** ISO date, e.g. "2026-11-24". */
  date: string
  /** Short label for axes, e.g. "Nov 24". */
  label: string
  visits: number
  /** Positive-like percentage for that day (sample). */
  likePercent: number
}

export const GAMES: GameInfo[] = [
  {
    id: 'fishing',
    name: 'Fishing Game',
    platform: 'Roblox',
    totalVisits: 155_000,
    likePercent: 88,
    color: '#7ab8ff',
  },
  {
    id: 'mount-nyong',
    name: 'Mount Nyong',
    platform: 'Roblox',
    totalVisits: 156_000,
    likePercent: 87,
    color: '#ff90e8',
  },
]

export const SERIES_DAYS = 30

/** Deterministic PRNG so the sample series is stable across reloads. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateSeries(game: GameInfo, seed: number, baseDaily: number): DayPoint[] {
  const rand = mulberry32(seed)
  const points: DayPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = SERIES_DAYS - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dayIndex = SERIES_DAYS - 1 - i

    const dow = d.getDay()
    const weekendBoost = dow === 0 || dow === 6 ? 1.35 : 1
    const trend = 1 + dayIndex * 0.004 // gentle growth over the month
    const noise = 0.78 + rand() * 0.48 // ±~25% daily noise
    const visits = Math.round(baseDaily * weekendBoost * trend * noise)

    const likePercent = Math.min(
      95,
      Math.max(80, game.likePercent + (rand() - 0.5) * 3.6),
    )

    points.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits,
      likePercent: Math.round(likePercent * 10) / 10,
    })
  }
  return points
}

/** Sample daily series per game id, generated once at module load. */
export const SERIES: Record<string, DayPoint[]> = Object.fromEntries(
  GAMES.map((g, i) => [
    g.id,
    generateSeries(g, 20261127 + i * 7919, g.id === 'fishing' ? 1450 : 1650),
  ]),
)

/** Merge several games' series into one combined series (visits summed,
 *  like % weighted by visits). */
export function combineSeries(seriesList: DayPoint[][]): DayPoint[] {
  if (seriesList.length === 0) return []
  const days = seriesList[0].length
  const out: DayPoint[] = []
  for (let i = 0; i < days; i++) {
    let visits = 0
    let weightedLike = 0
    for (const s of seriesList) {
      visits += s[i].visits
      weightedLike += s[i].visits * s[i].likePercent
    }
    out.push({
      date: seriesList[0][i].date,
      label: seriesList[0][i].label,
      visits,
      likePercent: visits > 0 ? Math.round((weightedLike / visits) * 10) / 10 : 0,
    })
  }
  return out
}

export function sliceDays(points: DayPoint[], days: number): DayPoint[] {
  return points.slice(-days)
}

export function sumVisits(points: DayPoint[]): number {
  return points.reduce((acc, p) => acc + p.visits, 0)
}

/** Visit-weighted average like % across the given points. */
export function avgLikePercent(points: DayPoint[]): number {
  const total = sumVisits(points)
  if (total === 0) return 0
  const weighted = points.reduce((acc, p) => acc + p.visits * p.likePercent, 0)
  return Math.round((weighted / total) * 10) / 10
}

/** Percent change of the second half vs the first half of a series. */
export function halfOverHalfChange(points: DayPoint[]): number | null {
  if (points.length < 4) return null
  const mid = Math.floor(points.length / 2)
  const first = sumVisits(points.slice(0, mid))
  const second = sumVisits(points.slice(mid))
  if (first === 0) return null
  return Math.round(((second - first) / first) * 1000) / 10
}

/** 155000 -> "155K", 1650 -> "1,650". */
export function formatCompact(n: number): string {
  if (n >= 1000) {
    const v = n / 1000
    return `${Number.isInteger(v) ? v : v.toFixed(1)}K`
  }
  return String(n)
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}
