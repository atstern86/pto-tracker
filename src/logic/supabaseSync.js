import { supabase } from './supabase'

/**
 * Sync local trips to Supabase shared_absences table.
 * Only pushes date ranges — never trip names, hours, or balances.
 */
export async function syncTripsToSupabase(localTrips, userId) {
  if (!supabase || !userId) return

  try {
    // Get current rows for this user
    const { data: existing, error: fetchError } = await supabase
      .from('shared_absences')
      .select('id, local_trip_id, start_date, end_date')
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    const existingMap = new Map((existing || []).map(r => [r.local_trip_id, r]))
    const localIds = new Set(localTrips.map(t => t.id))

    // Upsert new/changed trips
    const upserts = localTrips.map(trip => ({
      user_id: userId,
      local_trip_id: trip.id,
      start_date: trip.startDate,
      end_date: trip.endDate,
      updated_at: new Date().toISOString(),
    }))

    if (upserts.length > 0) {
      const { error: upsertError } = await supabase
        .from('shared_absences')
        .upsert(upserts, { onConflict: 'user_id,local_trip_id' })
      if (upsertError) throw upsertError
    }

    // Delete rows for trips that no longer exist locally
    const toDelete = (existing || [])
      .filter(r => !localIds.has(r.local_trip_id))
      .map(r => r.id)

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('shared_absences')
        .delete()
        .in('id', toDelete)
      if (deleteError) throw deleteError
    }
  } catch (err) {
    console.warn('Supabase sync failed (will retry on next load):', err.message)
  }
}

/**
 * Fetch all colleagues' absences (everyone except the current user).
 * Returns: [{ displayName, startDate, endDate }]
 */
export async function fetchColleagueAbsences(userId) {
  if (!supabase || !userId) return []

  try {
    const { data, error } = await supabase
      .from('shared_absences')
      .select('start_date, end_date, profiles(display_name)')
      .neq('user_id', userId)

    if (error) throw error

    return (data || []).map(row => ({
      displayName: row.profiles?.display_name || 'Unknown',
      startDate: row.start_date,
      endDate: row.end_date,
    }))
  } catch (err) {
    console.warn('Failed to fetch colleague absences:', err.message)
    return []
  }
}

/**
 * One-time migration: upload existing localStorage data to Supabase on first sign-in.
 */
export async function migrateLocalData(profile, trips, userId) {
  if (!supabase || !userId) return

  try {
    // Create or update profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: profile.name,
      }, { onConflict: 'id' })

    if (profileError) throw profileError

    // Sync all trips
    await syncTripsToSupabase(trips, userId)
  } catch (err) {
    console.warn('Migration failed (will retry on next load):', err.message)
  }
}
