import { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { FEDERAL_HOLIDAYS } from '../logic/holidays'
import { parseISO } from 'date-fns'

// Computed once at module load — not inside the component — to avoid 44 parseISO calls per render
const holidayDates = FEDERAL_HOLIDAYS.map(d => parseISO(d))
const holidaySet = new Set(FEDERAL_HOLIDAYS)

// Distinct colors for colleague dots — none close to the user's purple (#7c3aed)
const DOT_COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#ec4899', '#f97316', '#06b6d4']

const USER_DOT_COLOR = '#7c3aed'

function buildUserTripSet(trips) {
  const set = new Set()
  if (!trips?.length) return set
  for (const trip of trips) {
    const start = parseISO(trip.startDate)
    const end = parseISO(trip.endDate)
    const current = new Date(start)
    while (current <= end) {
      set.add(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`)
      current.setDate(current.getDate() + 1)
    }
  }
  return set
}

/**
 * Build a lookup: ISO date string -> array of colleague names out that day.
 * Only includes dates within a reasonable window to avoid huge maps.
 */
function buildAbsenceMap(colleagueAbsences) {
  const map = new Map()
  if (!colleagueAbsences?.length) return map

  for (const absence of colleagueAbsences) {
    const start = parseISO(absence.startDate)
    const end = parseISO(absence.endDate)
    const current = new Date(start)
    // Walk each day in the range
    while (current <= end) {
      const iso = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
      if (!map.has(iso)) map.set(iso, [])
      const names = map.get(iso)
      if (!names.includes(absence.displayName)) {
        names.push(absence.displayName)
      }
      current.setDate(current.getDate() + 1)
    }
  }
  return map
}

export default function CalendarPicker({ selected, onSelect, defaultMonth, colleagueAbsences, trips }) {
  const absenceMap = useMemo(() => buildAbsenceMap(colleagueAbsences), [colleagueAbsences])
  const userTripSet = useMemo(() => buildUserTripSet(trips), [trips])

  // Collect all unique colleague names, sorted — index determines color (guaranteed unique)
  const colleagueNames = useMemo(() => {
    const names = new Set()
    if (colleagueAbsences?.length) {
      for (const a of colleagueAbsences) names.add(a.displayName)
    }
    return [...names].sort()
  }, [colleagueAbsences])

  const nameToColor = useMemo(() => {
    const map = {}
    colleagueNames.forEach((name, i) => { map[name] = DOT_COLORS[i % DOT_COLORS.length] })
    return map
  }, [colleagueNames])

  function DayContent({ date }) {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const isHoliday = holidaySet.has(iso)
    const colleaguesOut = absenceMap.get(iso) || []
    const isMyTrip = userTripSet.has(iso)

    return (
      <div className="flex flex-col items-center leading-none">
        <span>{date.getDate()}</span>
        {isHoliday && (
          <span style={{ fontSize: '7px', color: '#10b981', lineHeight: 1.2, marginTop: '1px' }}>
            free 🎉
          </span>
        )}
        {(isMyTrip || colleaguesOut.length > 0) && (
          <div className="flex gap-0.5 mt-0.5">
            {isMyTrip && (
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: USER_DOT_COLOR,
                  display: 'inline-block',
                }}
              />
            )}
            {colleaguesOut.map(name => (
              <span
                key={name}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: nameToColor[name],
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rdp-custom">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={defaultMonth ?? (selected?.from ?? new Date())}
        numberOfMonths={1}
        disabled={{ before: new Date() }}
        modifiers={{ holiday: holidayDates }}
        modifiersStyles={{
          holiday: { color: '#10b981', fontWeight: 'bold' },
        }}
        styles={{
          root: { '--rdp-accent-color': '#7c3aed', '--rdp-background-color': '#ede9fe' },
        }}
        components={{ DayContent }}
      />

      {/* Legend */}
      {(userTripSet.size > 0 || colleagueNames.length > 0) && (
        <div className="flex flex-wrap gap-3 px-2 pt-2 pb-1">
          {userTripSet.size > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: USER_DOT_COLOR,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>You</span>
            </div>
          )}
          {colleagueNames.map(name => (
            <div key={name} className="flex items-center gap-1.5">
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: nameToColor[name],
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
