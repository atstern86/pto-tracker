import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { buildTimeline, getProjectedBalance } from '../logic/calculations'
import BalanceDisplay from '../components/BalanceDisplay'

function groupIntoSegments(events) {
  const segments = []
  let accrualBuffer = []

  function flushBuffer() {
    if (accrualBuffer.length === 0) return
    const first = accrualBuffer[0]
    const last = accrualBuffer[accrualBuffer.length - 1]
    segments.push({
      type: 'accrual-group',
      events: [...accrualBuffer],
      startDate: first.date,
      endDate: last.date,
      totalHours: accrualBuffer.reduce((sum, e) => sum + e.hours, 0),
      runningBalanceAfter: last.runningBalance,
    })
    accrualBuffer = []
  }

  for (const event of events) {
    if (event.type === 'accrual') {
      accrualBuffer.push(event)
    } else {
      flushBuffer()
      segments.push(event)
    }
  }
  flushBuffer()
  return segments
}

export default function Timeline({ profile, trips, onPlanTrip, onEditTrip }) {
  const events = useMemo(() => buildTimeline(profile, trips), [profile, trips])
  const segments = useMemo(() => groupIntoSegments(events), [events])
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayBalance = useMemo(() => getProjectedBalance(today, profile, trips), [today, profile, trips])
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  function toggleGroup(idx) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  // Empty state: show when no trips planned
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
        <button
          onClick={onPlanTrip}
          className="mt-4 font-bold py-3 px-6 rounded-2xl text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #9333ea)',
            color: 'white',
            fontFamily: 'var(--font-body)',
          }}
        >
          + Plan a Trip ✈️
        </button>
      </div>
    )
  }

  function formatDateRange(startDate, endDate) {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const sameYear = start.getFullYear() === end.getFullYear()
    if (startDate === endDate) return format(start, 'MMM d, yyyy')
    return sameYear
      ? `${format(start, 'MMM d')} → ${format(end, 'MMM d, yyyy')}`
      : `${format(start, 'MMM d, yyyy')} → ${format(end, 'MMM d, yyyy')}`
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
          <BalanceDisplay hours={todayBalance} profile={profile} />
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: '17px', background: 'var(--color-primary-light, #ede9fe)' }}
        />

        {segments.map((segment, i) => {
          if (segment.type === 'trip') {
            return (
              <div key={`trip-${segment.id}`} className="flex gap-3 mb-4 items-start">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-1 border-2"
                  style={{
                    background: 'var(--color-primary)',
                    borderColor: 'white',
                    boxShadow: '0 0 0 2px #ede9fe',
                  }}
                />
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
                        {format(parseISO(segment.date), 'MMM d, yyyy')}
                      </div>
                      <div
                        className="font-medium text-sm mt-0.5"
                        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
                      >
                        ✈️ {segment.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>
                        –{segment.hours.toFixed(2)} hrs
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => onEditTrip({ id: segment.id, name: segment.name, startDate: segment.date, endDate: segment.endDate })}
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ background: 'var(--color-primary-light, #ede9fe)', color: 'var(--color-primary)' }}
                      >
                        ✏️ Edit
                      </button>
                      <div className="text-right">
                        <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                          Balance after
                        </div>
                        <BalanceDisplay hours={segment.runningBalance} profile={profile} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // accrual-group
          const isExpanded = expandedGroups.has(i)
          const count = segment.events.length
          return (
            <div key={`group-${i}`} className="mb-4">
              {/* Collapsed summary row */}
              <div className="flex gap-3 items-start">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-1 border-2"
                  style={{
                    background: 'var(--color-success)',
                    borderColor: 'white',
                    boxShadow: '0 0 0 2px #d1fae5',
                    opacity: 0.7,
                  }}
                />
                <button
                  onClick={() => toggleGroup(i)}
                  className="flex-1 rounded-xl shadow-sm p-3 text-left transition-all active:scale-[0.99]"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                        {formatDateRange(segment.startDate, segment.endDate)}
                      </div>
                      <div
                        className="font-medium text-sm mt-0.5"
                        style={{ color: 'var(--color-success)' }}
                      >
                        {count} pay period{count !== 1 ? 's' : ''} · +{segment.totalHours.toFixed(2)} hrs
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <BalanceDisplay hours={segment.runningBalanceAfter} profile={profile} size="sm" />
                        <span
                          className="text-base leading-none transition-transform duration-200"
                          style={{
                            color: 'var(--color-success)',
                            display: 'inline-block',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                        >
                          ›
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-success)', opacity: 0.7 }}>
                        {isExpanded ? 'tap to collapse' : 'tap for details'}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Expanded individual accruals */}
              {isExpanded && (
                <div className="ml-7 mt-2 flex flex-col gap-2">
                  {segment.events.map((event, j) => (
                    <div key={j} className="flex gap-3 items-start">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1 border-2"
                        style={{
                          background: 'var(--color-success)',
                          borderColor: 'white',
                          boxShadow: '0 0 0 1px #d1fae5',
                        }}
                      />
                      <div
                        className="flex-1 rounded-xl shadow-sm p-2.5"
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-card-border, #f3f0ff)',
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                              {format(parseISO(event.date), 'MMM d, yyyy')}
                            </div>
                            <div className="font-medium text-sm mt-0.5" style={{ color: 'var(--color-success)' }}>
                              +{event.hours.toFixed(2)} hrs accrued
                            </div>
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
