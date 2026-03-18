import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../logic/supabase'
import { syncTripsToSupabase, fetchColleagueAbsences, migrateLocalData } from '../logic/supabaseSync'
import { loadProfile, loadTrips, isMigrated, setMigrated } from '../logic/storage'

/**
 * Custom hook that manages Supabase auth, sync, and realtime subscriptions.
 * Returns { user, colleagueAbsences, signIn, signOut, isOnline }
 *
 * If Supabase is not configured (no env vars), everything returns safe defaults
 * and the app works in local-only mode.
 */
export default function useSupabase(trips) {
  const [user, setUser] = useState(null)
  const [colleagueAbsences, setColleagueAbsences] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const subscriptionRef = useRef(null)
  const prevTripsRef = useRef(null)
  const debounceRef = useRef(null)

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // On auth + online: migrate if needed, fetch colleagues, subscribe to realtime
  useEffect(() => {
    if (!supabase || !user || !isOnline) return

    let cancelled = false

    async function init() {
      // One-time migration
      if (!isMigrated()) {
        const profile = loadProfile()
        const localTrips = loadTrips()
        if (profile) {
          await migrateLocalData(profile, localTrips, user.id)
          setMigrated()
        }
      }

      // Fetch current colleague absences
      const absences = await fetchColleagueAbsences(user.id)
      if (!cancelled) setColleagueAbsences(absences)
    }

    init()

    // Subscribe to realtime changes on shared_absences.
    // Only react to OTHER users' changes — filter out our own user_id
    // to avoid a sync → realtime → re-render → sync loop.
    const channel = supabase
      .channel('shared_absences_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shared_absences',
        filter: `user_id=neq.${user.id}`,
      }, async () => {
        // Debounce: if multiple changes arrive quickly, only fetch once
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
          const absences = await fetchColleagueAbsences(user.id)
          if (!cancelled) setColleagueAbsences(absences)
        }, 500)
      })
      .subscribe()

    subscriptionRef.current = channel

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [user, isOnline])

  // Sync trips to Supabase when trips actually change (not on every render)
  useEffect(() => {
    if (!supabase || !user || !isOnline) return

    // Only sync if trips actually changed (compare serialized values)
    const tripsJson = JSON.stringify(trips)
    if (prevTripsRef.current === tripsJson) return
    prevTripsRef.current = tripsJson

    syncTripsToSupabase(trips, user.id)
  }, [trips, user, isOnline])

  // Sign in with Google OAuth
  const signIn = useCallback(async () => {
    if (!supabase) return { error: { message: 'Supabase is not configured' } }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setColleagueAbsences([])
  }, [])

  return { user, colleagueAbsences, signIn, signOut, isOnline }
}
