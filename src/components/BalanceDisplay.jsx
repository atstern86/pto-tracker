import { getDaysDenominator } from '../logic/calculations'

export default function BalanceDisplay({ hours, profile, size = 'md', className = '' }) {
  const denominator = getDaysDenominator(profile)
  const days = hours / denominator
  const isNegative = hours < 0

  const absHours = Math.abs(hours)
  const absDays = Math.abs(days)

  const daysText = `${isNegative ? '–' : ''}${absDays.toFixed(1)} days`
  const hoursText = `${isNegative ? '–' : ''}${absHours.toFixed(2)} hrs`

  if (size === 'hero') {
    return (
      <div className={`${className}`}>
        <div className={`text-5xl font-black tracking-tight ${isNegative ? 'text-[var(--color-danger)]' : 'text-white'}`}>
          {daysText}
        </div>
        <div className="text-base text-white/70 mt-1">{hoursText}</div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <span className={`font-semibold ${isNegative ? 'text-[var(--color-danger)]' : ''}`}>
        {daysText}
      </span>
      <span className="text-[var(--color-muted)] text-sm ml-1">/ {hoursText}</span>
    </div>
  )
}
