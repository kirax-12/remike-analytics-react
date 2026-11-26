import { GAMES } from '../data/games'

export type GameSelection = 'all' | string

interface GameSwitcherProps {
  value: GameSelection
  onChange: (selection: GameSelection) => void
}

export default function GameSwitcher({ value, onChange }: GameSwitcherProps) {
  return (
    <div className="toggle-row" role="group" aria-label="Game filter">
      <button
        type="button"
        className={`toggle-btn${value === 'all' ? ' active' : ''}`}
        aria-pressed={value === 'all'}
        onClick={() => onChange('all')}
      >
        All games
      </button>
      {GAMES.map((game) => (
        <button
          key={game.id}
          type="button"
          className={`toggle-btn${value === game.id ? ' active' : ''}`}
          aria-pressed={value === game.id}
          onClick={() => onChange(game.id)}
        >
          <span className="dot" style={{ background: game.color }} aria-hidden="true" />
          {game.name}
        </button>
      ))}
    </div>
  )
}
