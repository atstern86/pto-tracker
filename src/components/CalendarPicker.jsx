import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { FEDERAL_HOLIDAYS } from '../logic/holidays'
import { parseISO } from 'date-fns'

// Computed once at module load — not inside the component — to avoid 44 parseISO calls per render
const holidayDates = FEDERAL_HOLIDAYS.map(d => parseISO(d))
const holidaySet = new Set(FEDERAL_HOLIDAYS)

function DayContent({ date }) {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const isHoliday = holidaySet.has(iso)
  return (
    <div className="flex flex-col items-center leading-none">
      <span>{date.getDate()}</span>
      {isHoliday && (
        <span style={{ fontSize: '7px', color: '#10b981', lineHeight: 1.2, marginTop: '1px' }}>
          free 🎉
        </span>
      )}
    </div>
  )
}

export default function CalendarPicker({ selected, onSelect, defaultMonth }) {
  return (
    <div className="rdp-custom">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={defaultMonth ?? (selected?.from ?? new Date())}
        numberOfMonths={1}
        modifiers={{ holiday: holidayDates }}
        modifiersStyles={{
          holiday: { color: '#10b981', fontWeight: 'bold' },
        }}
        styles={{
          root: { '--rdp-accent-color': '#7c3aed', '--rdp-background-color': '#ede9fe' },
        }}
        components={{ DayContent }}
      />
    </div>
  )
}
