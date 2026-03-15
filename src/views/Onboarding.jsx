export default function Onboarding({ onComplete }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6c3483] to-[#a855f7] flex items-center justify-center p-6">
      <div className="text-center text-white">
        <div className="text-5xl mb-4">✈️</div>
        <h1 className="text-2xl font-bold mb-4">PTO Tracker</h1>
        <p className="mb-6 text-white/70">Setup coming soon...</p>
        <button
          onClick={() => onComplete({
            name: 'Test User',
            employmentType: 'full-time',
            schedule: {},
            currentBalanceHours: 40,
            balanceAsOfDate: new Date().toISOString().slice(0, 10),
            payPeriodFrequency: 'biweekly',
            payPeriodAnchorDate: '2026-01-02',
            accrualRateHours: 3.75,
          })}
          className="bg-white text-[#6c3483] font-bold px-6 py-3 rounded-xl"
        >
          Skip Setup (Dev Only)
        </button>
      </div>
    </div>
  )
}
