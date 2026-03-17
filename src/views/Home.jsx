import { useMemo } from 'react'
import { format } from 'date-fns'
import { getProjectedBalance } from '../logic/calculations'
import { saveTrips } from '../logic/storage'
import BalanceDisplay from '../components/BalanceDisplay'
import TripCard from '../components/TripCard'
import AuthPrompt from '../components/AuthPrompt'

export default function Home({ profile, trips, onPlanTrip, onTripsChange, onEditTrip, user, signIn }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const currentBalance = useMemo(
    () => getProjectedBalance(today, profile, trips),
    [today, profile, trips]
  )

  const upcomingTrips = trips
    .filter(t => t.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  function handleDelete(tripId) {
    const updated = trips.filter(t => t.id !== tripId)
    saveTrips(updated)
    onTripsChange(updated)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* ── Hero gradient card ── */}
      <div
        className="relative overflow-hidden hero-grain px-6 pt-14 pb-10"
        style={{
          background: 'linear-gradient(145deg, #3b0764 0%, #6d28d9 45%, #9333ea 75%, #c2410c 100%)',
          borderBottomLeftRadius: '2rem',
          borderBottomRightRadius: '2rem',
          boxShadow: '0 8px 32px rgba(109, 40, 217, 0.35)',
        }}
      >
        {/* Decorative arc/compass rose in upper right */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        />

        <p
          className="animate-slide-up text-sm font-semibold uppercase tracking-widest mb-2"
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-body)',
            animationDelay: '0s',
          }}
        >
          ✈️ &nbsp;Your PTO Balance
        </p>

        <div
          className="animate-slide-up"
          style={{ animationDelay: '0.08s' }}
        >
          <BalanceDisplay hours={currentBalance} profile={profile} size="hero" />
        </div>

        <p
          className="animate-slide-up text-xs mt-3"
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-body)',
            animationDelay: '0.16s',
          }}
        >
          as of today, {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* ── Plan a Trip CTA ── */}
      <div className="px-6 -mt-5 relative z-10">
        <button
          onClick={onPlanTrip}
          className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #f59e0b 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.4)',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.filter = 'brightness(1.06)'
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(217, 119, 6, 0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'brightness(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(217, 119, 6, 0.4)'
          }}
        >
          + Plan a Trip ✈️
        </button>
      </div>

      {/* ── Connect with colleagues ── */}
      <div className="px-6 mt-5">
        <AuthPrompt user={user} signIn={signIn} />
      </div>

      {/* ── Upcoming trips ── */}
      <div className="px-6 mt-2">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Planned Trips
        </h2>

        {upcomingTrips.length === 0 ? (
          <EmptyState />
        ) : (
          upcomingTrips.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              profile={profile}
              allTrips={trips}
              onDelete={handleDelete}
              onEdit={onEditTrip}
              index={i}
            />
          ))
        )}
      </div>

      {/* Bottom breathing room above nav */}
      <div style={{ height: '1.5rem' }} />
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="animate-slide-up text-center py-14 px-6 rounded-3xl"
      style={{
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-card-border)',
        animationDelay: '0.2s',
      }}
    >
      <div
        className="text-5xl mb-4"
        style={{ lineHeight: 1 }}
        role="img"
        aria-label="globe"
      >
        🌍
      </div>
      <p
        className="font-semibold text-base mb-1"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text)',
        }}
      >
        Where will you go first?
      </p>
      <p
        className="text-sm"
        style={{ color: 'var(--color-muted)' }}
      >
        Tap "Plan a Trip" to start dreaming
      </p>
    </div>
  )
}
