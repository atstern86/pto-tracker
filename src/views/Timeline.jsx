import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { buildTimeline } from '../logic/calculations'
import BalanceDisplay from '../components/BalanceDisplay'

export default function Timeline({ profile, trips }) {
  const events = useMemo(() => buildTimeline(profile, trips), [profile, trips])

  // Empty state: show when no trips planned (buildTimeline always has accrual events)
  if (trips.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✈️</div>
        <p
          className="font-semibold text-lg"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Your adventure timeline starts here
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
          Go to Home and plan your first trip!
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-6">
      <h1
        className="text-2xl font-bold mb-6 px-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Timeline 📅
      </h1>

      {/* Today marker */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: 'var(--color-primary)' }}
        />
        <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Today
        </div>
        <div className="ml-auto">
          <BalanceDisplay hours={profile.currentBalanceHours} profile={profile} />
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: '17px', background: 'var(--color-primary-light, #ede9fe)' }}
        />

        {events.map((event, i) => (
          <div key={i} className="flex gap-3 mb-4 items-start">
            {/* Dot */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-1 border-2"
              style={{
                background: event.type === 'accrual' ? 'var(--color-success)' : 'var(--color-primary)',
                borderColor: 'white',
                boxShadow: '0 0 0 2px ' + (event.type === 'accrual' ? '#d1fae5' : '#ede9fe'),
              }}
            />

            {/* Card */}
            <div
              className="flex-1 rounded-xl shadow-sm p-3"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-card-border, #f3f0ff)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                    {format(parseISO(event.date), 'MMM d, yyyy')}
                  </div>
                  {event.type === 'accrual' ? (
                    <div
                      className="font-medium text-sm mt-0.5"
                      style={{ color: 'var(--color-success)' }}
                    >
                      +{event.hours.toFixed(2)} hrs accrued
                    </div>
                  ) : (
                    <div
                      className="font-medium text-sm mt-0.5"
                      style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
                    >
                      ✈️ {event.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                    Balance after
                  </div>
                  <BalanceDisplay hours={event.runningBalance} profile={profile} size="sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
