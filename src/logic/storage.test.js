import { loadProfile, saveProfile, loadTrips, saveTrips, clearAll } from './storage'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('saveProfile and loadProfile round-trip', () => {
    const profile = { name: 'Gaby', employmentType: 'part-time', currentBalanceHours: 93.75 }
    saveProfile(profile)
    expect(loadProfile()).toEqual(profile)
  })

  it('loadProfile returns null when nothing saved', () => {
    expect(loadProfile()).toBeNull()
  })

  it('saveTrips and loadTrips round-trip', () => {
    const trips = [{ id: '1', name: 'Beach', startDate: '2026-07-04', endDate: '2026-07-08' }]
    saveTrips(trips)
    expect(loadTrips()).toEqual(trips)
  })

  it('loadTrips returns empty array when nothing saved', () => {
    expect(loadTrips()).toEqual([])
  })

  it('clearAll removes profile and trips', () => {
    saveProfile({ name: 'Test' })
    saveTrips([{ id: '1' }])
    clearAll()
    expect(loadProfile()).toBeNull()
    expect(loadTrips()).toEqual([])
  })
})
