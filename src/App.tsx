import { useMemo, useState } from 'react'
import Header from './components/Header'
import StatCard from './components/StatCard'
import RangeToggle, { type RangeDays } from './components/RangeToggle'
import GameSwitcher, { type GameSelection } from './components/GameSwitcher'
import VisitsChart from './components/VisitsChart'
import GameTable, { type GameRowStats } from './components/GameTable'
import {
  GAMES,
  SERIES,
  combineSeries,
  sliceDays,
  sumVisits,
  halfOverHalfChange,
  formatCompact,
  formatNumber,
} from './data/games'

// Combined series is computed once, outside the component — it never changes.
const ALL_SERIES = combineSeries(GAMES.map((g) => SERIES[g.id]))

export default function App() {
  const [range, setRange] = useState<RangeDays>(30)
  const [selection, setSelection] = useState<GameSelection>('all')

  const selectedGame =
    selection === 'all' ? null : (GAMES.find((g) => g.id === selection) ?? null)

  const fullSeries = selectedGame ? SERIES[selectedGame.id] : ALL_SERIES
  const activePoints = useMemo(() => sliceDays(fullSeries, range), [fullSeries, range])

  // Headline stats are the REAL all-time numbers from the Roblox pages.
  const totalVisitsReal = selectedGame
    ? selectedGame.totalVisits
    : GAMES.reduce((acc, g) => acc + g.totalVisits, 0)
  const avgLikeReal = selectedGame
    ? selectedGame.likePercent
    : Math.round((GAMES.reduce((acc, g) => acc + g.likePercent, 0) / GAMES.length) * 10) / 10

  // Range stats come from the sample series.
  const rangeVisits = sumVisits(activePoints)
  const change = halfOverHalfChange(activePoints)

  const rows: GameRowStats[] = useMemo(
    () =>
      GAMES.map((game) => {
        const pts = sliceDays(SERIES[game.id], range)
        const total = sumVisits(pts)
        const best = pts.reduce((b, p) => (p.visits > b.visits ? p : b), pts[0])
        return {
          game,
          rangeVisits: total,
          avgDaily: Math.round(total / pts.length),
          bestDayVisits: best.visits,
          bestDayLabel: best.label,
        }
      }),
    [range],
  )

  return (
    <>
      <Header />

      <main className="layout">
        <section className="stat-grid" aria-label="Headline stats">
          <StatCard
            label="TOTAL VISITS · ALL TIME"
            value={`${formatCompact(totalVisitsReal)}+`}
            sub={
              selectedGame
                ? `Real stat — ${selectedGame.name} on Roblox`
                : 'Real stat — both games combined'
            }
          />
          <StatCard
            label="AVG LIKE % · ALL TIME"
            value={`${avgLikeReal}%`}
            sub="Real stat — positive ratings on Roblox"
          />
          <StatCard
            label="GAMES TRACKED"
            value={String(GAMES.length)}
            sub={GAMES.map((g) => g.name).join(' · ')}
          />
          <StatCard
            label={`VISITS · LAST ${range} DAYS`}
            value={formatNumber(rangeVisits)}
            sub={
              <>
                Simulated sample data
                {change !== null && (
                  <span className="delta">
                    {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% 2nd half vs 1st
                  </span>
                )}
              </>
            }
          />
        </section>

        <section className="card" aria-label="Daily visits chart">
          <div className="card-head">
            <div>
              <h2>Daily visits</h2>
              <p className="card-sub">Simulated sample series — hover the chart to inspect a day.</p>
            </div>
            <RangeToggle value={range} onChange={setRange} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <GameSwitcher value={selection} onChange={setSelection} />
          </div>
          <VisitsChart
            points={activePoints}
            color={selectedGame ? selectedGame.color : '#4ade80'}
            seriesLabel={selectedGame ? selectedGame.name : 'All games combined'}
          />
        </section>

        <section className="card" aria-label="Games table">
          <div className="card-head">
            <div>
              <h2>Games</h2>
              <p className="card-sub">
                Click a row to filter the dashboard. Totals and like % are real; range columns are
                sample data.
              </p>
            </div>
          </div>
          <GameTable rows={rows} rangeDays={range} selected={selection} onSelect={setSelection} />
        </section>
      </main>

      <footer className="site-foot">
        <div className="card">
          <p>
            <strong>About the data:</strong> the headline totals — Fishing Game at 155,000+ visits
            with 88% positive likes, and Mount Nyong at 156,000+ visits with an 87% rating — are
            real numbers from the games' Roblox pages. The daily time series is{' '}
            <strong>simulated sample data</strong>, generated in code (seeded, so it is stable
            across reloads) and anchored to those real totals. This demo does not call the Roblox
            API.
          </p>
          <p>
            Built by <strong>Remike Dev</strong> (GitHub:{' '}
            <a href="https://github.com/kirax-12">@kirax-12</a>) · React + TypeScript + Vite ·
            chart hand-rolled in SVG, no chart library.
          </p>
        </div>
      </footer>
    </>
  )
}
