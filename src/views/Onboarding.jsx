import { useState } from 'react'
import { format } from 'date-fns'
import { saveProfile } from '../logic/storage'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function Step({ title, subtitle, children, onNext, onBack, nextLabel = 'Next →', nextDisabled = false, step, total }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6c3483] to-[#a855f7] flex flex-col p-6">
      <div className="flex items-center justify-between mb-8 mt-8">
        <div className="text-white/60 text-sm">{step} of {total}</div>
        {onBack && (
          <button onClick={onBack} className="text-white/70 text-sm">← Back</button>
        )}
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-white/70 mb-6">{subtitle}</p>}
        {children}
      </div>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="w-full bg-white text-[#6c3483] font-bold py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel}
      </button>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-white/80 text-sm mb-1">{label}</label>
      <input
        className="w-full bg-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 text-base border border-white/30 focus:outline-none focus:border-white"
        {...props}
      />
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [schedule, setSchedule] = useState({ monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' })
  const [balance, setBalance] = useState('')
  const [balanceDate, setBalanceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [payFrequency, setPayFrequency] = useState('')
  const [anchorDate, setAnchorDate] = useState('')
  const [accrualRate, setAccrualRate] = useState('')

  function validate(msg) { alert(msg) }

  function handleStep1Next() {
    if (!name.trim()) return validate('Please enter your name.')
    setStep(2)
  }

  function handleStep2Next() {
    if (!employmentType) return validate('Please select your employment type.')
    setStep(employmentType === 'part-time' ? 3 : 4)
  }

  function handleStep3Next() {
    const hours = Object.values(schedule).map(Number)
    if (hours.every(h => h === 0 || isNaN(h))) return validate('Enter hours for at least one day.')
    const invalid = hours.some(h => !isNaN(h) && (h < 0 || h > 24))
    if (invalid) return validate('Hours per day must be between 0 and 24.')
    setStep(4)
  }

  function handleStep4Next() {
    const bal = parseFloat(balance)
    if (isNaN(bal) || bal < 0 || bal > 9999) return validate('Enter a valid balance between 0 and 9999 hours.')
    if (!balanceDate) return validate('Please enter the balance date.')
    setStep(5)
  }

  function handleStep5Next() {
    if (!payFrequency) return validate('Please select a pay period frequency.')
    if (payFrequency === 'biweekly') {
      if (!anchorDate) return validate('Please enter a recent pay date.')
      if (anchorDate > format(new Date(), 'yyyy-MM-dd')) return validate('Anchor date must be today or in the past.')
    }
    setStep(6)
  }

  function handleStep6Next() {
    const rate = parseFloat(accrualRate)
    if (isNaN(rate) || rate <= 0 || rate > 99) return validate('Enter a valid accrual rate between 0.01 and 99 hours.')

    const normalizedSchedule = {}
    DAYS.forEach(d => { normalizedSchedule[d] = parseFloat(schedule[d]) || 0 })

    const profile = {
      name: name.trim(),
      employmentType,
      schedule: employmentType === 'part-time' ? normalizedSchedule : {},
      currentBalanceHours: parseFloat(balance),
      balanceAsOfDate: balanceDate,
      payPeriodFrequency: payFrequency,
      payPeriodAnchorDate: payFrequency === 'biweekly' ? anchorDate : null,
      accrualRateHours: rate,
    }
    saveProfile(profile)
    onComplete(profile)
  }

  const totalSteps = employmentType === 'part-time' ? 6 : 5

  if (step === 1) return (
    <Step title="Welcome! 👋" subtitle="Let's get your PTO set up in about 2 minutes." onNext={handleStep1Next} step={1} total={totalSteps}>
      <Input label="What's your name?" placeholder="Gaby" value={name} onChange={e => setName(e.target.value)} />
    </Step>
  )

  if (step === 2) return (
    <Step title="Employment type" subtitle="This affects how your PTO days are calculated." onNext={handleStep2Next} step={2} total={totalSteps}>
      {['full-time', 'part-time'].map(type => (
        <button
          key={type}
          onClick={() => setEmploymentType(type)}
          className={`w-full text-left p-4 rounded-2xl mb-3 border-2 font-medium
            ${employmentType === type ? 'bg-white text-[#6c3483] border-white' : 'bg-white/20 text-white border-white/30'}`}
        >
          {type === 'full-time' ? '💼 Full-time (37.5 hrs/week)' : '🕐 Part-time (custom schedule)'}
        </button>
      ))}
    </Step>
  )

  if (step === 3) return (
    <Step title="Your weekly schedule" subtitle="Enter hours worked each day. Leave 0 for days off." onNext={handleStep3Next} onBack={() => setStep(2)} step={3} total={totalSteps}>
      {DAYS.map((day, i) => (
        <Input
          key={day}
          label={DAY_LABELS[i]}
          type="number"
          placeholder="0"
          min="0"
          max="24"
          step="0.25"
          value={schedule[day]}
          onChange={e => setSchedule(s => ({ ...s, [day]: e.target.value }))}
        />
      ))}
    </Step>
  )

  if (step === 4) return (
    <Step title="Current PTO balance" subtitle="Check your most recent pay stub for hours available." onNext={handleStep4Next} onBack={() => setStep(employmentType === 'part-time' ? 3 : 2)} step={employmentType === 'part-time' ? 4 : 3} total={totalSteps}>
      <Input label="Hours available (e.g. 93.75)" type="number" min="0" max="9999" step="0.01" placeholder="0" value={balance} onChange={e => setBalance(e.target.value)} />
      <Input label="As of this date" type="date" value={balanceDate} onChange={e => setBalanceDate(e.target.value)} />
    </Step>
  )

  if (step === 5) return (
    <Step title="Pay period" subtitle="How often do you get paid?" onNext={handleStep5Next} onBack={() => setStep(4)} step={employmentType === 'part-time' ? 5 : 4} total={totalSteps}>
      {['biweekly', 'semi-monthly'].map(freq => (
        <button
          key={freq}
          onClick={() => setPayFrequency(freq)}
          className={`w-full text-left p-4 rounded-2xl mb-3 border-2 font-medium
            ${payFrequency === freq ? 'bg-white text-[#6c3483] border-white' : 'bg-white/20 text-white border-white/30'}`}
        >
          {freq === 'biweekly' ? '📆 Every two weeks' : '📆 Twice a month (1st & 15th)'}
        </button>
      ))}
      {payFrequency === 'biweekly' && (
        <Input label="A recent pay date (any past pay date)" type="date" value={anchorDate} onChange={e => setAnchorDate(e.target.value)} />
      )}
    </Step>
  )

  return (
    <Step title="Accrual rate" subtitle="How many PTO hours do you earn each pay period?" onNext={handleStep6Next} onBack={() => setStep(5)} nextLabel="Let's go! 🚀" step={totalSteps} total={totalSteps}>
      <Input label="Hours per pay period (e.g. 3.75)" type="number" min="0.01" max="99" step="0.01" placeholder="3.75" value={accrualRate} onChange={e => setAccrualRate(e.target.value)} />
      <p className="text-white/60 text-sm mt-2">You can always change this in Settings later.</p>
    </Step>
  )
}
