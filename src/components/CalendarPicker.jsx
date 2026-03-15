import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { FEDERAL_HOLIDAYS } from '../logic/holidays'
import { parseISO } from 'date-fns'

export default function CalendarPicker({ selected, onSelect }) {
  const holidayDates = FEDERAL_HOLIDAYS.map(d => parseISO(d))

  return (
    <div className="rdp-custom">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        fromDate={new Date()}
        numberOfMonths={1}
        modifiers={{ holiday: holidayDates }}
        modifiersStyles={{
          holiday: { color: '#10b981', fontWeight: 'bold' },
        }}
        styles={{
          root: { '--rdp-accent-color': '#7c3aed', '--rdp-background-color': '#ede9fe' },
        }}
      />
      <p className="text-xs text-center mt-1" style={{ color: 'var(--color-success)' }}>
        🎉 Green dates = federal holidays (free days!)
      </p>
    </div>
  )
}
