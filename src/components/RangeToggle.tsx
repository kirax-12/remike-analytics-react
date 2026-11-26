export type RangeDays = 7 | 30

interface RangeToggleProps {
  value: RangeDays
  onChange: (range: RangeDays) => void
}

const OPTIONS: RangeDays[] = [7, 30]

export default function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div className="toggle-row" role="group" aria-label="Date range">
      {OPTIONS.map((days) => (
        <button
          key={days}
          type="button"
          className={`toggle-btn${value === days ? ' active' : ''}`}
          aria-pressed={value === days}
          onClick={() => onChange(days)}
        >
          {days} days
        </button>
      ))}
    </div>
  )
}
