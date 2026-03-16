import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import CalendarPicker from '../components/CalendarPicker'
import BalanceDisplay from '../components/BalanceDisplay'
import { calculateTripCost, getProjectedBalance } from '../logic/calculations'
import { saveTrips } from '../logic/storage'

export default function PlanTrip({ profile, trips, editTrip = null, onAdd, onEdit, onClose }) {
  const [range, setRange] = useState(editTrip ? {
    from: parseISO(editTrip.startDate),
    to: parseISO(editTrip.endDate),
  } : undefined)
  const [tripName, setTripName] = useState(editTrip?.name ?? '')
  const isEditing = editTrip !== null

  // Exclude the trip being edited from balance calculations so it doesn't double-count
  const tripsForCalc = isEditing ? trips.filter(t => t.id !== editTrip.id) : trips

  const tripCost = useMemo(() => {
    if (!range?.from || !range?.to) return null
    return calculateTripCost(
      format(range.from, 'yyyy-MM-dd'),
      format(range.to, 'yyyy-MM-dd'),
      profile
    )
  }, [range, profile])

  const balanceGoingIn = useMemo(() => {
    if (!range?.from) return null
    return getProjectedBalance(format(range.from, 'yyyy-MM-dd'), profile, tripsForCalc)
  }, [range, profile, tripsForCalc])

  const isSufficient = tripCost !== null && balanceGoingIn !== null && balanceGoingIn >= tripCost

  function handleAdd() {
    if (!range?.from || !range?.to || tripCost === null) return
    if (isEditing) {
      const updatedTrip = { ...editTrip, name: tripName.trim(), startDate: format(range.from, 'yyyy-MM-dd'), endDate: format(range.to, 'yyyy-MM-dd') }
      const updated = trips.map(t => t.id === editTrip.id ? updatedTrip : t).sort((a, b) => a.startDate.localeCompare(b.startDate))
      saveTrips(updated)
      onEdit(updatedTrip)
    } else {
      const newTrip = { id: uuidv4(), name: tripName.trim(), startDate: format(range.from, 'yyyy-MM-dd'), endDate: format(range.to, 'yyyy-MM-dd') }
      const updated = [...trips, newTrip].sort((a, b) => a.startDate.localeCompare(b.startDate))
      saveTrips(updated)
      onAdd(newTrip)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #6c3483 0%, #7c3aed 60%, #a855f7 100%)',
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top))',
          paddingBottom: '1.25rem',
        }}
      >
        <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
          {isEditing ? 'Edit Trip ✏️' : 'Plan a Trip ✈️'}
        </h2>
        <button onClick={onClose} className="text-white/70 text-sm font-medium px-3 py-2">
          ✕ Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Calendar */}
        <div
          className="rounded-2xl shadow-sm p-2 mb-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <CalendarPicker
            selected={range}
            onSelect={setRange}
            defaultMonth={range?.from}
          />
        </div>

        {/* Live preview — shown after range is selected */}
        {range?.from && range?.to && tripCost !== null && (
          <div
            className="rounded-2xl shadow-sm p-4 mb-4 animate-slide-up"
            style={{ background: 'var(--color-surface)' }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
            >
              Trip Summary
            </h3>

            <div className="flex justify-between mb-3">
              <div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                  PTO used
                </div>
                <BalanceDisplay hours={tripCost} profile={profile} />
              </div>
              <div className="text-right">
                <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                  Balance going in
                </div>
                <BalanceDisplay hours={balanceGoingIn} profile={profile} />
              </div>
            </div>

            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: isSufficient ? '#f0fdf4' : '#fff1f2',
                color: isSufficient ? '#15803d' : 'var(--color-danger)',
                border: isSufficient ? '1px solid #bbf7d0' : '1px solid #fecdd3',
              }}
            >
              {isSufficient
                ? `✅ You'll have enough PTO for this trip!`
                : `⚠️ You might be short ${Math.abs(balanceGoingIn - tripCost).toFixed(2)} hrs`}
            </div>
          </div>
        )}

        {/* Trip name input — shown after range selected */}
        {range?.from && range?.to && (
          <div
            className="rounded-2xl shadow-sm p-4 mb-6 animate-slide-up"
            style={{ background: 'var(--color-surface)', animationDelay: '0.05s' }}
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
            >
              Trip name <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Beach trip, Family visit…"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base focus:outline-none"
              style={{
                border: '1.5px solid var(--color-card-border)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-card-border)' }}
            />
          </div>
        )}
      </div>

      {/* Add button — pb accounts for iOS safe area (home indicator) */}
      <div
        className="px-6 pt-4"
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-card-border)',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={handleAdd}
          disabled={!range?.from || !range?.to || tripCost === null}
          className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #9333ea)',
            color: 'white',
            fontFamily: 'var(--font-body)',
          }}
        >
          {isEditing ? 'Save Changes' : 'Add Trip'}
        </button>
      </div>
    </div>
  )
}
