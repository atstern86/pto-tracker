import { calculateTripCost, getProjectedBalance } from '../logic/calculations'
import BalanceDisplay from './BalanceDisplay'
import { format, parseISO } from 'date-fns'

// Destination emoji picked by trip index mod — gives each card a distinct feel
const DESTINATION_ICONS = ['🏖️', '🏔️', '🌴', '🗺️', '🌊', '🏕️', '✈️', '🌅']

function getDestinationIcon(tripId) {
  // Use a simple hash of the id string to pick consistently
  const hash = String(tripId).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return DESTINATION_ICONS[hash % DESTINATION_ICONS.length]
}

export default function TripCard({ trip, profile, allTrips, onDelete, index = 0 }) {
  const cost = calculateTripCost(trip.startDate, trip.endDate, profile)
  const balanceBefore = getProjectedBalance(trip.startDate, profile, allTrips)
  const balanceAfter = balanceBefore - cost
  const isSufficient = balanceBefore >= cost

  const formatDate = iso => format(parseISO(iso), 'MMM d')
  const tripName = trip.name || `Trip on ${formatDate(trip.startDate)}`
  const icon = getDestinationIcon(trip.id)

  // Stagger each card's entrance animation
  const animationDelay = `${index * 0.08}s`

  return (
    <div
      className="animate-card mb-3"
      style={{ animationDelay }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-card-border)',
        }}
      >
        {/* Amber accent bar at top */}
        <div
          style={{
            height: '3px',
            background: isSufficient
              ? 'linear-gradient(90deg, var(--color-accent), #f59e0b)'
              : 'linear-gradient(90deg, var(--color-danger), #f87171)',
          }}
        />

        <div className="p-4">
          {/* Header row */}
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <span
                className="text-2xl leading-none mt-0.5 select-none"
                role="img"
                aria-hidden="true"
              >
                {icon}
              </span>
              <div>
                <div
                  className="font-semibold text-base leading-tight"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                  }}
                >
                  {tripName}
                </div>
                <div
                  className="text-sm mt-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDelete(trip.id)}
              className="rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fee2e2'
                e.currentTarget.style.color = 'var(--color-danger)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
              aria-label="Delete trip"
            >
              ✕
            </button>
          </div>

          {/* Balance row */}
          <div
            className="mt-3 pt-3 flex justify-between items-center"
            style={{ borderTop: '1px solid var(--color-card-border)' }}
          >
            <div>
              <div
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-muted)' }}
              >
                PTO used
              </div>
              <BalanceDisplay hours={cost} profile={profile} size="sm" />
            </div>

            <div
              className="w-px self-stretch mx-3"
              style={{ background: 'var(--color-card-border)' }}
            />

            <div className="text-right">
              <div
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: 'var(--color-muted)' }}
              >
                Balance after
              </div>
              <BalanceDisplay hours={balanceAfter} profile={profile} size="sm" />
            </div>
          </div>

          {/* Warning banner */}
          {!isSufficient && (
            <div
              className="mt-3 text-xs rounded-xl px-3 py-2 flex items-center gap-2"
              style={{
                background: '#fff1f2',
                color: 'var(--color-danger)',
                border: '1px solid #fecdd3',
              }}
            >
              <span>⚠️</span>
              <span>You may not have enough PTO for this trip</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
