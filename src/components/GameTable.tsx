import type { GameInfo } from '../data/games'
import { formatNumber } from '../data/games'
import type { GameSelection } from './GameSwitcher'

export interface GameRowStats {
  game: GameInfo
  /** Sample visits inside the currently selected range. */
  rangeVisits: number
  avgDaily: number
  bestDayVisits: number
  bestDayLabel: string
}

interface GameTableProps {
  rows: GameRowStats[]
  rangeDays: number
  selected: GameSelection
  onSelect: (selection: GameSelection) => void
}

export default function GameTable({ rows, rangeDays, selected, onSelect }: GameTableProps) {
  return (
    <div className="table-scroll">
      <table className="games">
        <thead>
          <tr>
            <th scope="col">Game</th>
            <th scope="col" className="num">Total visits</th>
            <th scope="col" className="num">Like %</th>
            <th scope="col" className="num">Visits · {rangeDays}d</th>
            <th scope="col" className="num">Avg / day</th>
            <th scope="col" className="num">Best day</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ game, rangeVisits, avgDaily, bestDayVisits, bestDayLabel }) => (
            <tr
              key={game.id}
              className={selected === game.id ? 'selected' : ''}
              onClick={() => onSelect(selected === game.id ? 'all' : game.id)}
              title="Click to filter the dashboard to this game"
            >
              <td>
                <span className="game-chip" style={{ background: game.color }} aria-hidden="true" />
                <span className="game-name">{game.name}</span>
                <span className="real-tag">REAL</span>
                <div className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
                  {game.platform}
                </div>
              </td>
              <td className="num mono">{formatNumber(game.totalVisits)}+</td>
              <td className="num mono">{game.likePercent}%</td>
              <td className="num mono">
                {formatNumber(rangeVisits)}
                <span className="real-tag sample-tag">SAMPLE</span>
              </td>
              <td className="num mono">{formatNumber(avgDaily)}</td>
              <td className="num mono">
                {formatNumber(bestDayVisits)}
                <div className="mono" style={{ fontSize: 12, opacity: 0.7 }}>
                  {bestDayLabel}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
