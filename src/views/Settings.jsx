import { useState } from 'react'
import { format } from 'date-fns'
import { saveProfile, saveTrips, clearAll } from '../logic/storage'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri' }

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      className="w-full rounded-xl px-4 py-3 text-base focus:outline-none"
      style={{
        border: '1.5px solid var(--color-card-border, #f3f0ff)',
        fontFamily: 'var(--font-body)',
        background: 'white',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-card-border, #f3f0ff)' }}
      {...props}
    />
  )
}

const today = format(new Date(), 'yyyy-MM-dd')

export default function Settings({ profile, trips, onProfileChange, onTripsChange, onReset }) {
  const [form, setForm] = useState({ ...profile, schedule: { ...profile.schedule } })
  const [saved, setSaved] = useState(false)
  const [savedBalanceDate, setSavedBalanceDate] = useState(null)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function setScheduleDay(day, value) {
    setForm(f => ({ ...f, schedule: { ...f.schedule, [day]: value } }))
    setSaved(false)
  }

  function handleSave() {
    if (!form.name.trim()) {
      alert('Please enter your name.')
      return
    }
    const bal = parseFloat(form.currentBalanceHours)
    if (isNaN(bal) || bal < 0 || bal > 9999) {
      alert('Balance must be between 0 and 9999 hours.')
      return
    }
    const rate = parseFloat(form.accrualRateHours)
    if (isNaN(rate) || rate <= 0 || rate > 99) {
      alert('Accrual rate must be between 0.01 and 99 hours.')
      return
    }
    if (form.payPeriodFrequency === 'biweekly') {
      if (!form.payPeriodAnchorDate) {
        alert('Please enter a recent pay date.')
        return
      }
      if (form.payPeriodAnchorDate > today) {
        alert('Anchor date must be today or in the past.')
        return
      }
    }
    if (form.employmentType === 'part-time') {
      const hours = DAYS.map(d => parseFloat(form.schedule[d]) || 0)
      if (hours.every(h => h === 0)) {
        alert('Enter hours for at least one working day.')
        return
      }
      if (hours.some(h => h < 0 || h > 24)) {
        alert('Hours per day must be between 0 and 24.')
        return
      }
    }

    const updated = { ...form }

    // If balance changed, update balanceAsOfDate to today
    const balanceActuallyChanged = parseFloat(form.currentBalanceHours) !== parseFloat(profile.currentBalanceHours)
    if (balanceActuallyChanged) {
      updated.balanceAsOfDate = today
      setSavedBalanceDate(format(new Date(), 'MMM d'))
    } else {
      setSavedBalanceDate(null)
    }

    // Normalize numbers
    updated.currentBalanceHours = bal
    updated.accrualRateHours = rate

    // Normalize part-time schedule
    if (updated.employmentType === 'part-time') {
      const normalized = {}
      DAYS.forEach(d => { normalized[d] = parseFloat(form.schedule[d]) || 0 })
      updated.schedule = normalized
    } else {
      updated.schedule = {}
    }

    saveProfile(updated)
    onProfileChange(updated)
    setSaved(true)
  }

  function handleDeleteTrip(id) {
    const updated = trips.filter(t => t.id !== id)
    saveTrips(updated)
    onTripsChange(updated)
  }

  function handleReset() {
    if (window.confirm('Reset everything? This will delete all your data and cannot be undone.')) {
      clearAll()
      onReset()
    }
  }

  const balanceChanged = parseFloat(form.currentBalanceHours) !== parseFloat(profile.currentBalanceHours)

  return (
    <div className="min-h-screen px-6 pt-12 pb-8" style={{ background: 'var(--color-bg)' }}>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Settings
      </h1>

      {/* Profile section */}
      <div
        className="rounded-2xl shadow-sm p-5 mb-4"
        style={{ background: 'var(--color-surface)' }}
      >
        <h2
          className="font-semibold mb-4"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
        >
          Profile
        </h2>

        <Field label="Name">
          <TextInput value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>

        <Field label="Employment type">
          <select
            value={form.employmentType}
            onChange={e => set('employmentType', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none"
            style={{
              border: '1.5px solid var(--color-card-border, #f3f0ff)',
              fontFamily: 'var(--font-body)',
              background: 'white',
            }}
          >
            <option value="full-time">Full-time (37.5 hrs/week)</option>
            <option value="part-time">Part-time (custom schedule)</option>
          </select>
        </Field>

        <Field label="Current PTO balance (hours)">
          <TextInput
            type="number"
            min="0"
            max="9999"
            step="0.01"
            value={form.currentBalanceHours}
            onChange={e => set('currentBalanceHours', e.target.value)}
          />
          {balanceChanged && !saved && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              ℹ️ Balance date will update to today when saved
            </p>
          )}
          {savedBalanceDate && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>
              ✓ Balance updated as of today, {savedBalanceDate}
            </p>
          )}
        </Field>

        <Field label="Accrual rate (hrs/pay period)">
          <TextInput
            type="number"
            min="0.01"
            max="99"
            step="0.01"
            value={form.accrualRateHours}
            onChange={e => set('accrualRateHours', e.target.value)}
          />
        </Field>

        <Field label="Pay period">
          <select
            value={form.payPeriodFrequency}
            onChange={e => set('payPeriodFrequency', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none"
            style={{
              border: '1.5px solid var(--color-card-border, #f3f0ff)',
              fontFamily: 'var(--font-body)',
              background: 'white',
            }}
          >
            <option value="biweekly">Every two weeks</option>
            <option value="semi-monthly">Twice a month (1st &amp; 15th)</option>
          </select>
        </Field>

        {form.payPeriodFrequency === 'biweekly' && (
          <Field label="Anchor pay date">
            <TextInput
              type="date"
              value={form.payPeriodAnchorDate || ''}
              onChange={e => set('payPeriodAnchorDate', e.target.value)}
            />
          </Field>
        )}

        {form.employmentType === 'part-time' && (
          <div className="mb-4">
            <div
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
            >
              Weekly schedule
            </div>
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3 mb-2">
                <span
                  className="w-10 text-sm flex-shrink-0"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {DAY_LABELS[day]}
                </span>
                <TextInput
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  value={form.schedule[day] ?? 0}
                  onChange={e => setScheduleDay(day, e.target.value)}
                />
                <span className="text-sm flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                  hrs
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full font-bold py-3 rounded-xl mt-2 transition-all active:scale-95"
          style={{
            background: saved
              ? 'var(--color-success)'
              : 'linear-gradient(135deg, var(--color-primary), #9333ea)',
            color: 'white',
            fontFamily: 'var(--font-body)',
          }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Trips section */}
      {trips.length > 0 && (
        <div
          className="rounded-2xl shadow-sm p-5 mb-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
          >
            Planned Trips
          </h2>
          {trips.map(trip => (
            <div
              key={trip.id}
              className="flex justify-between items-center py-3"
              style={{ borderBottom: '1px solid var(--color-card-border, #f3f0ff)' }}
            >
              <div>
                <div
                  className="font-medium text-sm"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
                >
                  {trip.name || `Trip on ${trip.startDate}`}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {trip.startDate} – {trip.endDate}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTrip(trip.id)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-danger)' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Danger zone */}
      <div
        className="rounded-2xl shadow-sm p-5"
        style={{ background: 'var(--color-surface)' }}
      >
        <h2
          className="font-semibold mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
        >
          Danger Zone
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
          Reset all data and start over. This cannot be undone.
        </p>
        <button
          onClick={handleReset}
          className="w-full font-medium py-3 rounded-xl transition-all active:scale-95"
          style={{
            border: '1.5px solid var(--color-danger)',
            color: 'var(--color-danger)',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
          }}
        >
          Reset Everything
        </button>
      </div>
    </div>
  )
}
