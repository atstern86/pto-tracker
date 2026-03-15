import { useState, useEffect } from 'react'
import { loadProfile, loadTrips } from './logic/storage'
import Onboarding from './views/Onboarding'
import Home from './views/Home'
import Timeline from './views/Timeline'
import Settings from './views/Settings'
import PlanTrip from './views/PlanTrip'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [trips, setTrips] = useState([])
  const [activeTab, setActiveTab] = useState('home')
  const [showPlanTrip, setShowPlanTrip] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setProfile(loadProfile())
    setTrips(loadTrips())
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <Home
            profile={profile}
            trips={trips}
            onPlanTrip={() => setShowPlanTrip(true)}
            onTripsChange={setTrips}
          />
        )}
        {activeTab === 'timeline' && (
          <Timeline
            profile={profile}
            trips={trips}
            onPlanTrip={() => { setActiveTab('home'); setShowPlanTrip(true) }}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            profile={profile}
            trips={trips}
            onProfileChange={setProfile}
            onTripsChange={setTrips}
            onReset={() => { setProfile(null); setTrips([]) }}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showPlanTrip && (
        <PlanTrip
          profile={profile}
          trips={trips}
          onAdd={(newTrip) => {
            const updated = [...trips, newTrip].sort((a, b) => a.startDate.localeCompare(b.startDate))
            setTrips(updated)
          }}
          onClose={() => setShowPlanTrip(false)}
        />
      )}

      <InstallPrompt />
    </div>
  )
}
