const KEYS = {
  PROFILE: 'pto_profile',
  TRIPS: 'pto_trips',
  INSTALL_DISMISSED: 'pto_install_dismissed',
  SUPABASE_MIGRATED: 'pto_supabase_migrated',
  AUTH_PROMPT_DISMISSED: 'pto_auth_prompt_dismissed',
}

export function loadProfile() {
  const raw = localStorage.getItem(KEYS.PROFILE)
  return raw ? JSON.parse(raw) : null
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

export function loadTrips() {
  const raw = localStorage.getItem(KEYS.TRIPS)
  return raw ? JSON.parse(raw) : []
}

export function saveTrips(trips) {
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips))
}

export function isInstallDismissed() {
  return localStorage.getItem(KEYS.INSTALL_DISMISSED) === 'true'
}

export function dismissInstall() {
  localStorage.setItem(KEYS.INSTALL_DISMISSED, 'true')
}

export function isMigrated() {
  return localStorage.getItem(KEYS.SUPABASE_MIGRATED) === 'true'
}

export function setMigrated() {
  localStorage.setItem(KEYS.SUPABASE_MIGRATED, 'true')
}

export function isAuthPromptDismissed() {
  return localStorage.getItem(KEYS.AUTH_PROMPT_DISMISSED) === 'true'
}

export function dismissAuthPrompt() {
  localStorage.setItem(KEYS.AUTH_PROMPT_DISMISSED, 'true')
}

export function clearAll() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key))
}
