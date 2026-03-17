import { useState, useEffect } from 'react'
import { loadProfile, loadTrips, saveTrips } from './logic/storage'
import Onboarding from './views/Onboarding'
import Home from './views/Home'
import Timeline from './views/Timeline'
import Settings from './views/Settings'
import PlanTrip from './views/PlanTrip'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import UpdateModal from './components/UpdateModal'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [trips, setTrips] = useState([])
  const [activeTab, setActiveTab] = useState('home')
  const [showPlanTrip, setShowPlanTrip] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    setProfile(loadProfile())
    setTrips(loadTrips())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const onUpdate = (e) => setWaitingWorker(e.detail)
    window.addEventListener('sw-update', onUpdate)
    return () => window.removeEventListener('sw-update', onUpdate)
  }, [])

  if (isLoading) return null

  if (!profile) {
    return (
      <>
        <Onboarding onComplete={(p) => setProfile(p)} />
        <InstallPrompt />
      </>
    )
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
            onEditTrip={(trip) => setEditingTrip(trip)}
          />
        )}
        {activeTab === 'timeline' && (
          <Timeline
            profile={profile}
            trips={trips}
            onPlanTrip={() => { setActiveTab('home'); setShowPlanTrip(true) }}
            onEditTrip={(trip) => setEditingTrip(trip)}
            onDeleteTrip={(id) => {
              const updated = trips.filter(t => t.id !== id)
              saveTrips(updated)
              setTrips(updated)
            }}
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

      {(showPlanTrip || editingTrip) && (
        <PlanTrip
          profile={profile}
          trips={trips}
          editTrip={editingTrip}
          onAdd={(newTrip) => {
            const updated = [...trips, newTrip].sort((a, b) => a.startDate.localeCompare(b.startDate))
            setTrips(updated)
          }}
          onEdit={(updatedTrip) => {
            const updated = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
            setTrips(updated)
          }}
          onClose={() => { setShowPlanTrip(false); setEditingTrip(null) }}
        />
      )}

      <InstallPrompt />

      {waitingWorker && (
        <UpdateModal onRefresh={() => {
          waitingWorker.postMessage('SKIP_WAITING')
          window.location.reload()
        }} />
      )}
    </div>
  )
}
