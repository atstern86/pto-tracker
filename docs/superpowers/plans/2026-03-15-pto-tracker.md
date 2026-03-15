# PTO Tracker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fun, mobile-first PWA that lets hospital Child Life Specialists track PTO accrual and plan vacations with confidence.

**Architecture:** React + Vite SPA with state-based view switching (no router). All data lives in localStorage — no backend. Deployed free to Netlify. Full-screen PWA on iPhone via Add to Home Screen.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, date-fns 2, react-day-picker 8, Vitest, Netlify

**Spec:** `docs/superpowers/specs/2026-03-15-pto-tracker-design.md`

**Note:** On first step of execution, copy this plan to `docs/superpowers/plans/2026-03-15-pto-tracker.md`.

---

## File Map

```
/
├── index.html                        # Vite entry + PWA meta tags
├── manifest.json                     # PWA manifest
├── netlify.toml                      # Redirect config for SPA
├── vite.config.js                    # Vite + Vitest config
├── tailwind.config.js                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── public/
│   ├── sw.js                         # Service worker
│   └── icons/                        # PWA icons (192, 512)
├── src/
│   ├── main.jsx                      # Mount React root
│   ├── App.jsx                       # View switcher + global state
│   ├── views/
│   │   ├── Onboarding.jsx            # 6-step setup wizard
│   │   ├── Home.jsx                  # Balance hero + trip list
│   │   ├── PlanTrip.jsx              # Calendar overlay + preview
│   │   ├── Timeline.jsx              # Chronological accrual/trip list
│   │   └── Settings.jsx              # Edit profile + manage trips
│   ├── components/
│   │   ├── BalanceDisplay.jsx        # Dual-unit display (days + hrs)
│   │   ├── TripCard.jsx              # Single trip row
│   │   ├── CalendarPicker.jsx        # react-day-picker range wrapper
│   │   ├── BottomNav.jsx             # Tab bar (Home / Timeline / Settings)
│   │   └── InstallPrompt.jsx         # iOS "Add to Home Screen" sheet
│   ├── logic/
│   │   ├── holidays.js               # US federal holidays 2025–2028
│   │   ├── storage.js                # localStorage read/write helpers
│   │   ├── calculations.js           # All PTO math (pure functions)
│   │   ├── holidays.test.js
│   │   ├── storage.test.js
│   │   └── calculations.test.js
│   └── styles/
│       └── index.css                 # Tailwind directives + CSS variables
├── CLAUDE.md
├── OPEN_QUESTIONS.md
└── FUTURE_FEATURE_IDEAS.md
```

---

## Chunk 1: Project Foundation

**Files:**
- Create: all config files, `src/main.jsx`, `src/styles/index.css`, `CLAUDE.md`, `OPEN_QUESTIONS.md`, `FUTURE_FEATURE_IDEAS.md`

### Task 1: Scaffold Vite + React project

- [ ] **Step 1: Create project**

```bash
cd "/Users/alex/claude_projects/Vacation Tracker"
npm create vite@latest . -- --template react
```

Expected: Vite scaffold created with `src/App.jsx`, `src/main.jsx`, `index.html`, `package.json`

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install date-fns@2 react-day-picker@8
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D tailwindcss@3 postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

Expected: `tailwind.config.js` and `postcss.config.js` created.

- [ ] **Step 5: Configure Tailwind** — replace `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 6: Configure Vitest** — replace `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 7: Create test setup file** `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Set up Tailwind CSS** — replace `src/index.css` (or `src/styles/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #7c3aed;
  --color-primary-dark: #5b21b6;
  --color-primary-light: #ede9fe;
  --color-accent: #f59e0b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-bg: #faf5ff;
  --color-surface: #ffffff;
  --color-text: #1f2937;
  --color-muted: #6b7280;
}
```

- [ ] **Step 9: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10: Verify setup**

```bash
npm run dev
```

Expected: Vite dev server starts at `http://localhost:5173`. Default React app visible in browser.

- [ ] **Step 11: Run empty test suite**

```bash
npm test
```

Expected: `No test files found` or similar. No errors.

---

### Task 2: Create project documentation files

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# PTO Tracker — CLAUDE.md

PWA for Gaby and 5 hospital colleagues to track PTO accrual and plan vacations.
For universal rules (working style, session ritual, guardrails), see global ~/.claude/CLAUDE.md.

---

## Tech & Dev Setup
Stack and setup details are in `DEVELOPMENT.md`.
Run locally: `npm run dev` · Tests: `npm test`

## Known Gotchas
- PTO is always tracked in **hours**, never days. Days are only a display conversion.
- Every balance display must show **both** days AND hours simultaneously.
- Federal holiday list is hardcoded in `src/logic/holidays.js` — covers 2025–2028. Update annually.
- Part-time day conversion: hours ÷ (weekly scheduled hours ÷ 5) — NOT ÷ 7.5.
- `hoursUsed` is never stored in trips — always derived at runtime from dates + profile.
- Editing balance in Settings MUST also update `balanceAsOfDate` to today.
- iOS does NOT support `beforeinstallprompt` — use custom `InstallPrompt.jsx` sheet instead.

## Reference Docs
- **`docs/superpowers/specs/2026-03-15-pto-tracker-design.md`** — Full design spec. Read when direction is unclear.
- **`OPEN_QUESTIONS.md`** — Unresolved business questions. Check before making assumptions.
- **`FUTURE_FEATURE_IDEAS.md`** — V2 ideas. Check when discussing features.

## Improving This File
Suggest updates rather than editing silently.
```

- [ ] **Step 2: Create `OPEN_QUESTIONS.md`**

```markdown
# Open Questions

Questions that need answers from hospital HR or Gaby before they can be encoded in the app.
Until answered, the app uses the assumption noted.

---

## Business Rules

**Q1: Does PTO accrue during vacation time?**
*Assumption used:* YES — the app adds accruals even on pay periods that fall within a planned trip.
*To verify with:* Hospital HR / payroll department

**Q2: What is the accrual rate for full-time employees?**
*Assumption used:* User-entered during onboarding — no default hardcoded.
*To verify with:* Gaby's HR documentation

**Q3: What is the accrual rate for part-time employees (Gaby)?**
*Assumption used:* User-entered during onboarding — no default hardcoded.
*To verify with:* Gaby's HR documentation

**Q4: What is the exact pay period frequency and anchor date used at the hospital?**
*Assumption used:* User-entered during onboarding (biweekly or semi-monthly + anchor date).
*To verify with:* Any recent pay stub
```

- [ ] **Step 3: Create `FUTURE_FEATURE_IDEAS.md`**

```markdown
# Future Feature Ideas

Ideas logged during development for future consideration. Do not build these in V1.

---

## V2 — Team Features

- **Shared team calendar**: All 6 colleagues can see each other's planned time off as dots or highlights on the trip calendar picker. Requires a backend (Supabase) and login.
- **Outlook/Google Calendar integration**: Import approved PTO from calendar to auto-populate trips. Show teammates' approved PTO on the date picker.
- **Cloud sync / data backup**: Sync localStorage data to the cloud so it survives phone replacement or browser clear.

## V2 — Profile Enhancements
- Support for non-Mon–Fri schedules (e.g. Tue–Sat hospital shift patterns)
- Multi-user profiles on a single device (for households, etc.)
```

- [ ] **Step 4: Commit foundation**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + Tailwind + Vitest project with docs"
```

---

## Chunk 2: Core Logic — Holidays & Storage

**Files:**
- Create: `src/logic/holidays.js`, `src/logic/holidays.test.js`
- Create: `src/logic/storage.js`, `src/logic/storage.test.js`

### Task 3: Federal holidays 2025–2028

- [ ] **Step 1: Write failing test** `src/logic/holidays.test.js`:

```js
import { isFederalHoliday, FEDERAL_HOLIDAYS } from './holidays'

describe('isFederalHoliday', () => {
  it('returns true for July 4th 2026', () => {
    // Jul 4 2026 is Saturday — observed Jul 3 (Fri)
    expect(isFederalHoliday('2026-07-03')).toBe(true)
  })

  it('returns false for July 4th 2026 (the actual Saturday)', () => {
    expect(isFederalHoliday('2026-07-04')).toBe(false)
  })

  it('returns true for Christmas 2025', () => {
    expect(isFederalHoliday('2025-12-25')).toBe(true)
  })

  it('returns false for a regular workday', () => {
    expect(isFederalHoliday('2026-03-15')).toBe(false)
  })

  it('returns false for a date outside covered range and logs a warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(isFederalHoliday('2030-01-01')).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('outside covered holiday range'))
    consoleSpy.mockRestore()
  })

  it('covers all years 2025–2028 in FEDERAL_HOLIDAYS', () => {
    const years = FEDERAL_HOLIDAYS.map(d => d.slice(0, 4))
    expect(years).toContain('2025')
    expect(years).toContain('2026')
    expect(years).toContain('2027')
    expect(years).toContain('2028')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- holidays
```

Expected: FAIL with "Cannot find module './holidays'"

- [ ] **Step 3: Implement `src/logic/holidays.js`**

```js
// US Federal Holidays (observed dates) 2025–2028
// When holiday falls on Saturday → observed Friday; on Sunday → observed Monday
// Source: https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/
export const FEDERAL_HOLIDAYS = [
  // 2025
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Jr. Day
  '2025-02-17', // Presidents' Day
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
  // 2026
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Jr. Day
  '2026-02-16', // Presidents' Day
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth
  '2026-07-03', // Independence Day (observed, Jul 4 is Sat)
  '2026-09-07', // Labor Day
  '2026-10-12', // Columbus Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
  // 2027
  '2027-01-01', // New Year's Day
  '2027-01-18', // MLK Jr. Day
  '2027-02-15', // Presidents' Day
  '2027-05-31', // Memorial Day
  '2027-06-18', // Juneteenth (observed, Jun 19 is Sat)
  '2027-07-05', // Independence Day (observed, Jul 4 is Sun)
  '2027-09-06', // Labor Day
  '2027-10-11', // Columbus Day
  '2027-11-11', // Veterans Day
  '2027-11-25', // Thanksgiving
  '2027-12-24', // Christmas (observed, Dec 25 is Sat)
  // 2028
  '2028-01-02', // New Year's Day (observed, Jan 1 is Sun)
  '2028-01-17', // MLK Jr. Day
  '2028-02-21', // Presidents' Day
  '2028-05-29', // Memorial Day
  '2028-06-19', // Juneteenth
  '2028-07-04', // Independence Day (Tue)
  '2028-09-04', // Labor Day
  '2028-10-09', // Columbus Day
  '2028-11-10', // Veterans Day (observed, Nov 11 is Sat)
  '2028-11-23', // Thanksgiving
  '2028-12-25', // Christmas
]

const COVERED_YEARS = new Set(['2025', '2026', '2027', '2028'])

const holidaySet = new Set(FEDERAL_HOLIDAYS)

/**
 * Returns true if the given ISO date string (YYYY-MM-DD) is a federal holiday.
 * Logs a console warning for dates outside the 2025–2028 coverage range.
 */
export function isFederalHoliday(isoDate) {
  const year = isoDate.slice(0, 4)
  if (!COVERED_YEARS.has(year)) {
    console.warn(`isFederalHoliday: ${isoDate} is outside covered holiday range (2025–2028). Treating as regular workday.`)
    return false
  }
  return holidaySet.has(isoDate)
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- holidays
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/holidays.js src/logic/holidays.test.js
git commit -m "feat: add federal holiday list 2025-2028 with coverage warning"
```

---

### Task 4: localStorage helpers

- [ ] **Step 1: Write failing test** `src/logic/storage.test.js`:

```js
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- storage
```

Expected: FAIL with "Cannot find module './storage'"

- [ ] **Step 3: Implement `src/logic/storage.js`**

```js
const KEYS = {
  PROFILE: 'pto_profile',
  TRIPS: 'pto_trips',
  INSTALL_DISMISSED: 'pto_install_dismissed',
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

export function clearAll() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key))
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- storage
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/storage.js src/logic/storage.test.js
git commit -m "feat: add localStorage helpers with tests"
```

---

## Chunk 3: Core Logic — Calculations

**Files:**
- Create: `src/logic/calculations.js`, `src/logic/calculations.test.js`

### Task 5: PTO calculation engine (TDD)

This is the most critical file in the app. All 5 functions are pure (no side effects) and fully tested before any UI is built.

- [ ] **Step 1: Write all failing tests** `src/logic/calculations.test.js`:

```js
import {
  getDayKey,
  getWorkingDayHours,
  calculateTripCost,
  getPayPeriodDates,
  getProjectedBalance,
  buildTimeline,
  getDaysDenominator,
} from './calculations'

// ─── Shared test profiles ───────────────────────────────────────────────────

const fullTimeProfile = {
  employmentType: 'full-time',
  schedule: {},
  currentBalanceHours: 40,
  balanceAsOfDate: '2026-01-01',
  payPeriodFrequency: 'biweekly',
  payPeriodAnchorDate: '2026-01-02', // Friday
  accrualRateHours: 3.75,
}

const partTimeProfile = {
  employmentType: 'part-time',
  schedule: { monday: 4.75, tuesday: 6, wednesday: 0, thursday: 7.5, friday: 0 },
  currentBalanceHours: 93.75,
  balanceAsOfDate: '2026-01-01',
  payPeriodFrequency: 'biweekly',
  payPeriodAnchorDate: '2026-01-02',
  accrualRateHours: 3.75,
}

// ─── getDayKey ───────────────────────────────────────────────────────────────

describe('getDayKey', () => {
  it('returns lowercase day name for a Monday', () => {
    expect(getDayKey('2026-03-16')).toBe('monday') // March 16 2026 is a Monday
  })
  it('returns "saturday" for a Saturday', () => {
    expect(getDayKey('2026-03-14')).toBe('saturday')
  })
})

// ─── getDaysDenominator ───────────────────────────────────────────────────────

describe('getDaysDenominator', () => {
  it('returns 7.5 for full-time', () => {
    expect(getDaysDenominator(fullTimeProfile)).toBe(7.5)
  })
  it('returns (18.25 / 5) = 3.65 for Gaby part-time', () => {
    expect(getDaysDenominator(partTimeProfile)).toBeCloseTo(3.65, 2)
  })
})

// ─── getWorkingDayHours ───────────────────────────────────────────────────────

describe('getWorkingDayHours', () => {
  describe('full-time', () => {
    it('returns 7.5 for a Monday', () => {
      expect(getWorkingDayHours('2026-03-16', fullTimeProfile)).toBe(7.5)
    })
    it('returns 0 for a Saturday', () => {
      expect(getWorkingDayHours('2026-03-14', fullTimeProfile)).toBe(0)
    })
    it('returns 0 for a Sunday', () => {
      expect(getWorkingDayHours('2026-03-15', fullTimeProfile)).toBe(0)
    })
    it('returns 0 for a federal holiday (observed Jul 3 2026)', () => {
      expect(getWorkingDayHours('2026-07-03', fullTimeProfile)).toBe(0)
    })
  })

  describe('part-time', () => {
    it('returns 4.75 for Monday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-16', partTimeProfile)).toBe(4.75) // Monday
    })
    it('returns 6 for Tuesday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-17', partTimeProfile)).toBe(6)   // Tuesday
    })
    it('returns 0 for Wednesday (Gaby off)', () => {
      expect(getWorkingDayHours('2026-03-18', partTimeProfile)).toBe(0)   // Wednesday
    })
    it('returns 7.5 for Thursday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-19', partTimeProfile)).toBe(7.5) // Thursday
    })
    it('returns 0 for Friday (Gaby off)', () => {
      expect(getWorkingDayHours('2026-03-20', partTimeProfile)).toBe(0)   // Friday
    })
    it('returns 0 for a federal holiday that falls on a scheduled day', () => {
      // Find a federal holiday on a Mon/Tue/Thu for part-time Gaby
      // Jan 19 2026 = Monday (MLK Day)
      expect(getWorkingDayHours('2026-01-19', partTimeProfile)).toBe(0)
    })
  })
})

// ─── calculateTripCost ────────────────────────────────────────────────────────

describe('calculateTripCost', () => {
  it('full week Mon–Fri full-time = 37.5 hrs', () => {
    // March 16–20 2026 (Mon–Fri), no holidays
    expect(calculateTripCost('2026-03-16', '2026-03-20', fullTimeProfile)).toBe(37.5)
  })

  it('full week Mon–Fri part-time = 18.25 hrs', () => {
    // 4.75 + 6 + 0 + 7.5 + 0
    expect(calculateTripCost('2026-03-16', '2026-03-20', partTimeProfile)).toBe(18.25)
  })

  it('week containing July 4 holiday (observed Jul 3 Fri 2026): full-time gets one free day', () => {
    // Jun 29 (Mon) – Jul 3 (Fri): Jul 3 is observed Independence Day
    // Mon–Thu = 4 × 7.5 = 30, Fri Jul 3 = 0 → 30
    expect(calculateTripCost('2026-06-29', '2026-07-03', fullTimeProfile)).toBe(30)
  })

  it('single day (Mon) full-time = 7.5 hrs', () => {
    expect(calculateTripCost('2026-03-16', '2026-03-16', fullTimeProfile)).toBe(7.5)
  })

  it('weekend only = 0 hrs', () => {
    expect(calculateTripCost('2026-03-14', '2026-03-15', fullTimeProfile)).toBe(0)
  })
})

// ─── getPayPeriodDates ────────────────────────────────────────────────────────

describe('getPayPeriodDates', () => {
  describe('biweekly', () => {
    it('returns pay dates within range, starting from first date on or after fromDate', () => {
      // Anchor: 2026-01-02 (Fri). Next: 2026-01-16, 2026-01-30, 2026-02-13...
      const dates = getPayPeriodDates('2026-01-10', '2026-02-20', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual(['2026-01-16', '2026-01-30', '2026-02-13'])
    })

    it('includes anchor date itself if it falls within range', () => {
      const dates = getPayPeriodDates('2026-01-02', '2026-01-02', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual(['2026-01-02'])
    })

    it('returns empty array when no pay dates fall in range', () => {
      const dates = getPayPeriodDates('2026-01-03', '2026-01-15', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual([])
    })
  })

  describe('semi-monthly', () => {
    it('returns 1st and 15th of each month in range', () => {
      const dates = getPayPeriodDates('2026-01-10', '2026-03-05', {
        payPeriodFrequency: 'semi-monthly',
        payPeriodAnchorDate: null,
      })
      expect(dates).toEqual(['2026-01-15', '2026-02-01', '2026-02-15', '2026-03-01'])
    })
  })
})

// ─── getProjectedBalance ──────────────────────────────────────────────────────

describe('getProjectedBalance', () => {
  it('returns starting balance when no time has passed and no trips', () => {
    expect(getProjectedBalance('2026-01-01', fullTimeProfile, [])).toBe(40)
  })

  it('adds accruals for pay periods between balanceAsOfDate and targetDate', () => {
    // Anchor 2026-01-02, balance as of Jan 1. Target: Feb 1.
    // Pay dates in (Jan1, Feb1]: Jan 2, Jan 16, Jan 30 → 3 accruals × 3.75 = 11.25
    // Total: 40 + 11.25 = 51.25
    expect(getProjectedBalance('2026-02-01', fullTimeProfile, [])).toBeCloseTo(51.25, 2)
  })

  it('pay period ON targetDate is included in accrual', () => {
    // Target = Jan 2 (pay date). Should include that accrual.
    // Pay periods in (Jan1, Jan2]: Jan 2 → 1 × 3.75 = 3.75 → 40 + 3.75 = 43.75
    expect(getProjectedBalance('2026-01-02', fullTimeProfile, [])).toBe(43.75)
  })

  it('deducts trip cost for trips with startDate strictly before targetDate', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-09' }] // Mon–Fri
    // Trip cost: 5 × 7.5 = 37.5 hrs. Target = Jan 10.
    // Accruals: Jan 2 only → +3.75. Total: 40 + 3.75 - 37.5 = 6.25
    expect(getProjectedBalance('2026-01-10', fullTimeProfile, trips)).toBeCloseTo(6.25, 2)
  })

  it('trip starting ON targetDate is NOT yet deducted (balance going into the trip)', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-09' }]
    // Target = Jan 5 (trip start). Trip NOT deducted. Accruals: Jan 2 → +3.75
    expect(getProjectedBalance('2026-01-05', fullTimeProfile, trips)).toBeCloseTo(43.75, 2)
  })

  it('can return negative balance', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-30' }] // 4 weeks
    const result = getProjectedBalance('2026-02-01', fullTimeProfile, trips)
    expect(result).toBeLessThan(0)
  })
})

// ─── buildTimeline ────────────────────────────────────────────────────────────

describe('buildTimeline', () => {
  it('returns sorted events with types accrual and trip', () => {
    const trips = [{ id: '1', name: 'Beach', startDate: '2026-06-01', endDate: '2026-06-05' }]
    const events = buildTimeline(fullTimeProfile, trips)
    const types = events.map(e => e.type)
    expect(types).toContain('accrual')
    expect(types).toContain('trip')
  })

  it('events are sorted by date ascending', () => {
    const events = buildTimeline(fullTimeProfile, [])
    const dates = events.map(e => e.date)
    const sorted = [...dates].sort()
    expect(dates).toEqual(sorted)
  })

  it('each event has a runningBalance field', () => {
    const events = buildTimeline(fullTimeProfile, [])
    events.forEach(e => expect(typeof e.runningBalance).toBe('number'))
  })

  it('covers approximately 18 months from today', () => {
    const events = buildTimeline(fullTimeProfile, [])
    const lastDate = new Date(events[events.length - 1].date)
    const eighteenMonths = new Date()
    eighteenMonths.setMonth(eighteenMonths.getMonth() + 18)
    expect(lastDate.getTime()).toBeLessThanOrEqual(eighteenMonths.getTime() + 86400000)
  })
})
```

- [ ] **Step 2: Run test — verify all fail**

```bash
npm test -- calculations
```

Expected: FAIL on all — "Cannot find module './calculations'"

- [ ] **Step 3: Implement `src/logic/calculations.js`**

```js
import { addDays, format, parseISO, isWeekend, getDay, eachDayOfInterval, addMonths, startOfMonth, setDate } from 'date-fns'
import { isFederalHoliday } from './holidays'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Returns lowercase day name for an ISO date string */
export function getDayKey(isoDate) {
  return DAY_KEYS[getDay(parseISO(isoDate))]
}

/** Returns the day-length denominator for converting hours to days */
export function getDaysDenominator(profile) {
  if (profile.employmentType === 'full-time') return 7.5
  const weeklyHours = Object.values(profile.schedule).reduce((sum, h) => sum + h, 0)
  return weeklyHours / 5
}

/**
 * Returns the PTO hours cost for a single date.
 * 0 for weekends, federal holidays, or non-scheduled part-time days.
 */
export function getWorkingDayHours(isoDate, profile) {
  if (isWeekend(parseISO(isoDate))) return 0
  if (isFederalHoliday(isoDate)) return 0
  if (profile.employmentType === 'full-time') return 7.5
  return profile.schedule[getDayKey(isoDate)] ?? 0
}

/**
 * Returns total PTO hours consumed by a trip (start to end, inclusive).
 * Always derived at runtime — never cached.
 */
export function calculateTripCost(startDate, endDate, profile) {
  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
  return days.reduce((sum, day) => sum + getWorkingDayHours(format(day, 'yyyy-MM-dd'), profile), 0)
}

/**
 * Returns all pay period dates (ISO strings) strictly within [fromDate, toDate] inclusive.
 * For biweekly: advances anchor to first pay date >= fromDate, then steps by 14 days.
 * For semi-monthly: returns 1st and 15th of each month in range.
 */
export function getPayPeriodDates(fromDate, toDate, profile) {
  const from = parseISO(fromDate)
  const to = parseISO(toDate)
  const results = []

  if (profile.payPeriodFrequency === 'biweekly') {
    let current = parseISO(profile.payPeriodAnchorDate)
    // Advance to first pay date >= fromDate
    while (current < from) current = addDays(current, 14)
    // Collect all dates <= toDate
    while (current <= to) {
      results.push(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 14)
    }
  } else {
    // Semi-monthly: 1st and 15th of each month
    let month = startOfMonth(from)
    while (month <= to) {
      for (const dayNum of [1, 15]) {
        const candidate = setDate(month, dayNum)
        if (candidate >= from && candidate <= to) {
          results.push(format(candidate, 'yyyy-MM-dd'))
        }
      }
      month = addMonths(month, 1)
    }
    results.sort()
  }

  return results
}

/**
 * Returns projected PTO balance in hours at targetDate.
 * Accruals on targetDate ARE included.
 * Trip deductions: trips with startDate strictly < targetDate are deducted.
 * (Balance shown "going into" a trip that starts on targetDate.)
 */
export function getProjectedBalance(targetDate, profile, trips) {
  const target = parseISO(targetDate)
  const balanceAsOf = parseISO(profile.balanceAsOfDate)

  // Count accrual events: pay periods strictly after balanceAsOfDate and on/before targetDate
  const accrualDates = getPayPeriodDates(
    format(addDays(balanceAsOf, 1), 'yyyy-MM-dd'),
    targetDate,
    profile
  )
  const totalAccrual = accrualDates.length * profile.accrualRateHours

  // Deduct trips that start strictly before targetDate
  const tripDeductions = trips
    .filter(t => parseISO(t.startDate) < target)
    .reduce((sum, t) => sum + calculateTripCost(t.startDate, t.endDate, profile), 0)

  return profile.currentBalanceHours + totalAccrual - tripDeductions
}

/**
 * Builds a chronological array of events (accruals + trips) for the next 18 months.
 * Each event includes a runningBalance field.
 */
export function buildTimeline(profile, trips) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const endDate = format(addMonths(new Date(), 18), 'yyyy-MM-dd')

  // Build accrual events
  const accrualDates = getPayPeriodDates(today, endDate, profile)
  const accrualEvents = accrualDates.map(date => ({
    type: 'accrual',
    date,
    hours: profile.accrualRateHours,
  }))

  // Build trip events (only future trips within window)
  const tripEvents = trips
    .filter(t => t.startDate >= today && t.startDate <= endDate)
    .map(t => ({
      type: 'trip',
      date: t.startDate,
      id: t.id,
      name: t.name || `Trip on ${t.startDate}`,
      startDate: t.startDate,
      endDate: t.endDate,
      hours: calculateTripCost(t.startDate, t.endDate, profile),
    }))

  // Sort all events by date
  const events = [...accrualEvents, ...tripEvents].sort((a, b) => a.date.localeCompare(b.date))

  // Compute running balance
  let balance = profile.currentBalanceHours
  // Add accruals from balanceAsOfDate to today first
  const pastAccruals = getPayPeriodDates(
    format(addDays(parseISO(profile.balanceAsOfDate), 1), 'yyyy-MM-dd'),
    today,
    profile
  )
  balance += pastAccruals.length * profile.accrualRateHours
  // Deduct past trips
  trips
    .filter(t => t.startDate < today)
    .forEach(t => { balance -= calculateTripCost(t.startDate, t.endDate, profile) })

  return events.map(event => {
    if (event.type === 'accrual') {
      balance += event.hours
    } else {
      balance -= event.hours
    }
    return { ...event, runningBalance: Math.round(balance * 100) / 100 }
  })
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test -- calculations
```

Expected: All tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: All tests in holidays, storage, calculations pass. No failures.

- [ ] **Step 6: Commit**

```bash
git add src/logic/calculations.js src/logic/calculations.test.js
git commit -m "feat: add PTO calculation engine with full test coverage"
```

---

## Chunk 4: App Shell

**Files:**
- Modify: `src/main.jsx`, `index.html`
- Create: `src/App.jsx`, `src/components/BottomNav.jsx`, `src/components/BalanceDisplay.jsx`

### Task 6: App shell and navigation

- [ ] **Step 1: Update `index.html`** — replace entire file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#7c3aed" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="PTO Tracker" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>PTO Tracker ✈️</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Update `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Create `src/App.jsx`**

```jsx
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
          <Timeline profile={profile} trips={trips} />
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
```

- [ ] **Step 4: Create `src/components/BottomNav.jsx`**

```jsx
export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex safe-bottom">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors
            ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 5: Create `src/components/BalanceDisplay.jsx`**

Always shows both days and hours. Used everywhere a balance is displayed.

```jsx
import { getDaysDenominator } from '../logic/calculations'

export default function BalanceDisplay({ hours, profile, size = 'md', className = '' }) {
  const denominator = getDaysDenominator(profile)
  const days = hours / denominator
  const isNegative = hours < 0

  const absHours = Math.abs(hours)
  const absDays = Math.abs(days)

  const daysText = `${isNegative ? '–' : ''}${absDays.toFixed(1)} days`
  const hoursText = `${isNegative ? '–' : ''}${absHours.toFixed(2)} hrs`

  if (size === 'hero') {
    return (
      <div className={`${className}`}>
        <div className={`text-5xl font-black tracking-tight ${isNegative ? 'text-[var(--color-danger)]' : 'text-white'}`}>
          {daysText}
        </div>
        <div className="text-base text-white/70 mt-1">{hoursText}</div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <span className={`font-semibold ${isNegative ? 'text-[var(--color-danger)]' : ''}`}>
        {daysText}
      </span>
      <span className="text-[var(--color-muted)] text-sm ml-1">/ {hoursText}</span>
    </div>
  )
}
```

- [ ] **Step 6: Create stub views** — create each of these with minimal placeholder content so the app renders without errors:

`src/views/Home.jsx`:
```jsx
export default function Home({ profile, trips, onPlanTrip, onTripsChange }) {
  return <div className="p-6"><h1>Home — TODO</h1></div>
}
```

`src/views/Timeline.jsx`:
```jsx
export default function Timeline({ profile, trips }) {
  return <div className="p-6"><h1>Timeline — TODO</h1></div>
}
```

`src/views/Settings.jsx`:
```jsx
export default function Settings({ profile, trips, onProfileChange, onTripsChange, onReset }) {
  return <div className="p-6"><h1>Settings — TODO</h1></div>
}
```

`src/views/PlanTrip.jsx`:
```jsx
export default function PlanTrip({ profile, trips, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 bg-white z-50 p-6">
      <h1>Plan a Trip — TODO</h1>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

`src/components/InstallPrompt.jsx`:
```jsx
export default function InstallPrompt() { return null }
```

- [ ] **Step 7: Verify app loads**

```bash
npm run dev
```

Expected: App loads in browser. Onboarding screen shows (since no localStorage data). No console errors.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add app shell, view routing, BottomNav, BalanceDisplay"
```

---

## Chunk 5: Onboarding Wizard

**Files:**
- Replace stub: `src/views/Onboarding.jsx`

### Task 7: Six-step setup wizard

- [ ] **Step 1: Implement `src/views/Onboarding.jsx`**

```jsx
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
```

- [ ] **Step 2: Test onboarding manually**

```bash
npm run dev
```

Open in browser. Walk through all 6 steps as a part-time user. Verify localStorage is populated after completion (check DevTools → Application → Local Storage).

- [ ] **Step 3: Test full-time path** — clear localStorage, repeat as full-time (should skip schedule step).

- [ ] **Step 4: Commit**

```bash
git add src/views/Onboarding.jsx
git commit -m "feat: implement 6-step onboarding wizard with validation"
```

---

## Chunk 6: Home Screen & TripCard

**Files:**
- Replace stub: `src/views/Home.jsx`
- Create: `src/components/TripCard.jsx`

### Task 8: Balance Hero and trip list

> Before implementing this chunk, invoke the `frontend-design` skill to establish the visual aesthetic direction for the entire app. The design should be fun, warm, travel-app-inspired — not a generic HR tool. Commit to a bold aesthetic before writing any Home screen code. Apply the chosen design system across all subsequent UI components.

- [ ] **Step 1: Invoke `@frontend-design` skill**

Before writing any UI code in this chunk, invoke the `frontend-design` skill to commit to a bold aesthetic direction for the entire app. The skill will guide choices for typography, color palette, motion, and distinctive visual elements. The session is set — fun, warm, travel-app-inspired with a purple base.

**Expected output before proceeding:** Update `src/styles/index.css` with refined CSS variables (fonts via @import, adjusted color palette), and document in a brief comment what the aesthetic direction is (e.g., font choice, key animation approach). This file is the single source of truth for the design system used by all subsequent components.

- [ ] **Step 2: Create `src/components/TripCard.jsx`**

```jsx
import { calculateTripCost, getProjectedBalance } from '../logic/calculations'
import BalanceDisplay from './BalanceDisplay'
import { format, parseISO } from 'date-fns'

export default function TripCard({ trip, profile, allTrips, onDelete }) {
  const cost = calculateTripCost(trip.startDate, trip.endDate, profile)
  const balanceBefore = getProjectedBalance(trip.startDate, profile, allTrips)
  const balanceAfter = balanceBefore - cost
  const isSufficient = balanceBefore >= cost

  const formatDate = iso => format(parseISO(iso), 'MMM d')
  const tripName = trip.name || `Trip on ${formatDate(trip.startDate)}`

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-[var(--color-text)]">{tripName}</div>
          <div className="text-sm text-[var(--color-muted)] mt-0.5">
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </div>
        </div>
        <button
          onClick={() => onDelete(trip.id)}
          className="text-[var(--color-muted)] hover:text-[var(--color-danger)] text-sm p-1"
          aria-label="Delete trip"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-purple-50 flex justify-between items-center">
        <div>
          <div className="text-xs text-[var(--color-muted)] mb-0.5">PTO used</div>
          <BalanceDisplay hours={cost} profile={profile} size="sm" />
        </div>
        <div className="text-right">
          <div className="text-xs text-[var(--color-muted)] mb-0.5">Balance after</div>
          <BalanceDisplay
            hours={balanceAfter}
            profile={profile}
            size="sm"
            className={!isSufficient ? 'text-[var(--color-danger)]' : ''}
          />
        </div>
      </div>

      {!isSufficient && (
        <div className="mt-2 text-xs text-[var(--color-danger)] bg-red-50 rounded-lg px-3 py-1.5">
          ⚠️ You may not have enough PTO for this trip
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement `src/views/Home.jsx`**

```jsx
import { useMemo } from 'react'
import { format } from 'date-fns'
import { getProjectedBalance, getDaysDenominator } from '../logic/calculations'
import { saveTrips } from '../logic/storage'
import BalanceDisplay from '../components/BalanceDisplay'
import TripCard from '../components/TripCard'

export default function Home({ profile, trips, onPlanTrip, onTripsChange }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const currentBalance = useMemo(
    () => getProjectedBalance(today, profile, trips),
    [today, profile, trips]
  )

  const upcomingTrips = trips.filter(t => t.endDate >= today)

  function handleDelete(tripId) {
    const updated = trips.filter(t => t.id !== tripId)
    saveTrips(updated)
    onTripsChange(updated)
  }

  return (
    <div className="min-h-screen">
      {/* Hero gradient card */}
      <div className="bg-gradient-to-br from-[#6c3483] via-[#7c3aed] to-[#a855f7] px-6 pt-14 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-white/70 text-sm font-medium mb-1 tracking-wide uppercase">
          ✈️ Your PTO Balance
        </p>
        <BalanceDisplay hours={currentBalance} profile={profile} size="hero" />
        <p className="text-white/60 text-xs mt-2">as of today, {format(new Date(), 'MMM d, yyyy')}</p>
      </div>

      {/* Plan a trip CTA */}
      <div className="px-6 -mt-5">
        <button
          onClick={onPlanTrip}
          className="w-full bg-[var(--color-accent)] text-white font-bold py-4 rounded-2xl text-base shadow-md hover:brightness-105 active:scale-95 transition-all"
        >
          + Plan a Trip ✈️
        </button>
      </div>

      {/* Upcoming trips */}
      <div className="px-6 mt-6">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">
          Planned Trips
        </h2>
        {upcomingTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌍</div>
            <p className="text-[var(--color-muted)] text-base">Where will you go first?</p>
            <p className="text-[var(--color-muted)] text-sm mt-1">Tap "Plan a Trip" to get started</p>
          </div>
        ) : (
          upcomingTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              profile={profile}
              allTrips={trips}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test in browser**

Open app. Complete onboarding. Verify:
- Balance hero shows the correct projected balance in both days AND hours
- "as of today" date is correct
- Empty state shows "Where will you go first? 🌍" with no trips
- Tapping "Plan a Trip" opens the stub overlay (full add-trip flow tested in Chunk 7)

- [ ] **Step 5: Commit**

```bash
git add src/views/Home.jsx src/components/TripCard.jsx
git commit -m "feat: implement home screen with balance hero and trip list"
```

---

## Chunk 7: Plan a Trip

**Files:**
- Replace stub: `src/views/PlanTrip.jsx`
- Create: `src/components/CalendarPicker.jsx`

### Task 9: Calendar overlay with live preview

- [ ] **Step 1: Install uuid**

```bash
npm install uuid
```

- [ ] **Step 2: Create `src/components/CalendarPicker.jsx`**

Note: `FEDERAL_HOLIDAYS` is a flat array of ISO date strings exported from `src/logic/holidays.js` (created in Chunk 2). `CalendarPicker` converts them to Date objects for react-day-picker's `modifiers` prop.

```jsx
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { isFederalHoliday, FEDERAL_HOLIDAYS } from '../logic/holidays'
import { parseISO, format } from 'date-fns'

export default function CalendarPicker({ selected, onSelect }) {
  // Modifiers for federal holidays
  const holidayDates = FEDERAL_HOLIDAYS.map(d => parseISO(d))

  return (
    <div className="rdp-custom">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        fromDate={new Date()}
        numberOfMonths={1}
        modifiers={{ holiday: holidayDates }}
        modifiersStyles={{
          holiday: { color: '#10b981', fontWeight: 'bold' },
        }}
        styles={{
          root: { '--rdp-accent-color': '#7c3aed', '--rdp-background-color': '#ede9fe' },
        }}
      />
      <p className="text-xs text-[var(--color-success)] text-center mt-1">
        🎉 Green dates = federal holidays (free days!)
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Implement `src/views/PlanTrip.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import CalendarPicker from '../components/CalendarPicker'
import BalanceDisplay from '../components/BalanceDisplay'
import { calculateTripCost, getProjectedBalance } from '../logic/calculations'
import { saveTrips } from '../logic/storage'

export default function PlanTrip({ profile, trips, onAdd, onClose }) {
  const [range, setRange] = useState(undefined)
  const [tripName, setTripName] = useState('')

  const tripCost = useMemo(() => {
    if (!range?.from || !range?.to) return null
    return calculateTripCost(
      format(range.from, 'yyyy-MM-dd'),
      format(range.to, 'yyyy-MM-dd'),
      profile
    )
  }, [range, profile])

  const balanceGoingIn = useMemo(() => {
    if (!range?.from) return null
    return getProjectedBalance(format(range.from, 'yyyy-MM-dd'), profile, trips)
  }, [range, profile, trips])

  const isSufficient = tripCost !== null && balanceGoingIn !== null && balanceGoingIn >= tripCost

  function handleAdd() {
    if (!range?.from || !range?.to || tripCost === null) return
    const newTrip = {
      id: uuidv4(),
      name: tripName.trim(),
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
    }
    const updated = [...trips, newTrip].sort((a, b) => a.startDate.localeCompare(b.startDate))
    saveTrips(updated)
    onAdd(newTrip)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6c3483] to-[#a855f7] px-6 py-5 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Plan a Trip ✈️</h2>
        <button onClick={onClose} className="text-white/70 text-sm">✕ Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-4">
          <CalendarPicker selected={range} onSelect={setRange} />
        </div>

        {/* Live preview */}
        {range?.from && range?.to && tripCost !== null && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Trip Summary</h3>

            <div className="flex justify-between mb-3">
              <div>
                <div className="text-xs text-[var(--color-muted)]">PTO used</div>
                <BalanceDisplay hours={tripCost} profile={profile} />
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--color-muted)]">Balance going in</div>
                <BalanceDisplay hours={balanceGoingIn} profile={profile} />
              </div>
            </div>

            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${isSufficient ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isSufficient
                ? `✅ You'll have enough PTO for this trip!`
                : `⚠️ You might be short ${Math.abs(balanceGoingIn - tripCost).toFixed(2)} hrs`}
            </div>
          </div>
        )}

        {/* Trip name */}
        {range?.from && range?.to && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Trip name (optional)
            </label>
            <input
              type="text"
              placeholder="Beach trip, Family visit..."
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleAdd}
          disabled={!range?.from || !range?.to || tripCost === null}
          className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Trip
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test manually**

Open app → Plan a Trip. Select a range. Verify:
- Trip cost shows in both days + hours
- Federal holidays in range reduce the cost
- Green checkmark if sufficient, red warning if not
- Confirm adds the trip, closes overlay, shows in home list

- [ ] **Step 5: Commit**

```bash
git add src/views/PlanTrip.jsx src/components/CalendarPicker.jsx package.json package-lock.json
git commit -m "feat: implement Plan a Trip calendar with live balance preview"
```

---

## Chunk 8: Timeline View

**Files:**
- Replace stub: `src/views/Timeline.jsx`

### Task 10: Chronological event list

- [ ] **Step 1: Implement `src/views/Timeline.jsx`**

```jsx
import { useMemo } from 'react'
import { format } from 'date-fns'
import { buildTimeline, getDaysDenominator } from '../logic/calculations'
import BalanceDisplay from '../components/BalanceDisplay'

export default function Timeline({ profile, trips }) {
  const events = useMemo(() => buildTimeline(profile, trips), [profile, trips])
  // Empty state triggers when there are no planned trips (not when events array is empty,
  // since buildTimeline always produces accrual events for any valid profile)
  const hasTrips = trips.length > 0

  if (!hasTrips) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✈️</div>
        <p className="text-[var(--color-text)] font-semibold text-lg">Your adventure timeline starts here</p>
        <p className="text-[var(--color-muted)] text-sm mt-2">Go to Home and plan your first trip!</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6 px-2">Timeline 📅</h1>

      {/* Today marker */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
        <div className="font-semibold text-[var(--color-text)]">Today</div>
        <div className="ml-auto">
          <BalanceDisplay hours={profile.currentBalanceHours} profile={profile} />
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-purple-100" />

        {events.map((event, i) => (
          <div key={i} className="flex gap-3 mb-4 items-start">
            {/* Dot */}
            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 border-2 border-white shadow
              ${event.type === 'accrual' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]'}`}
            />

            {/* Card */}
            <div className="flex-1 bg-white rounded-xl shadow-sm p-3 border border-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {format(new Date(event.date), 'MMM d, yyyy')}
                  </div>
                  {event.type === 'accrual' ? (
                    <div className="font-medium text-[var(--color-success)] text-sm mt-0.5">
                      +{event.hours.toFixed(2)} hrs accrued
                    </div>
                  ) : (
                    <div className="font-medium text-[var(--color-primary)] text-sm mt-0.5">
                      ✈️ {event.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-muted)]">Balance after</div>
                  <BalanceDisplay hours={event.runningBalance} profile={profile} size="sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test manually**

Open Timeline tab. Verify events are sorted chronologically, accruals show in green, trips in purple. Running balance updates correctly after each event.

- [ ] **Step 3: Commit**

```bash
git add src/views/Timeline.jsx
git commit -m "feat: implement chronological timeline with running balance"
```

---

## Chunk 9: Settings Screen

**Files:**
- Replace stub: `src/views/Settings.jsx`

### Task 11: Edit profile and manage trips

- [ ] **Step 1: Implement `src/views/Settings.jsx`**

```jsx
import { useState } from 'react'
import { format } from 'date-fns'
import { saveProfile, saveTrips, clearAll } from '../logic/storage'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri' }

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--color-muted)] mb-1">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)]"
      {...props}
    />
  )
}

export default function Settings({ profile, trips, onProfileChange, onTripsChange, onReset }) {
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function setScheduleDay(day, value) {
    setForm(f => ({ ...f, schedule: { ...f.schedule, [day]: value } }))
    setSaved(false)
  }

  function handleSave() {
    const bal = parseFloat(form.currentBalanceHours)
    if (isNaN(bal) || bal < 0 || bal > 9999) return alert('Balance must be between 0 and 9999 hours.')
    const rate = parseFloat(form.accrualRateHours)
    if (isNaN(rate) || rate <= 0 || rate > 99) return alert('Accrual rate must be between 0.01 and 99 hours.')
    if (form.employmentType === 'part-time') {
      const hours = DAYS.map(d => parseFloat(form.schedule[d]) || 0)
      if (hours.every(h => h === 0)) return alert('Enter hours for at least one working day.')
      if (hours.some(h => h < 0 || h > 24)) return alert('Hours per day must be between 0 and 24.')
    }

    const updated = { ...form }
    // If balance changed, update balanceAsOfDate to today
    if (parseFloat(form.currentBalanceHours) !== profile.currentBalanceHours) {
      updated.balanceAsOfDate = format(new Date(), 'yyyy-MM-dd')
    }
    // Normalize schedule
    if (updated.employmentType === 'part-time') {
      DAYS.forEach(d => { updated.schedule[d] = parseFloat(updated.schedule[d]) || 0 })
    }
    updated.currentBalanceHours = bal
    updated.accrualRateHours = rate
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

  return (
    <div className="min-h-screen px-6 pt-12 pb-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Settings ⚙️</h1>

      {/* Profile section */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Profile</h2>

        <Field label="Name">
          <TextInput value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>

        <Field label="Current PTO balance (hours)">
          <TextInput type="number" value={form.currentBalanceHours} onChange={e => set('currentBalanceHours', e.target.value)} />
          {form.currentBalanceHours !== profile.currentBalanceHours && (
            <p className="text-xs text-[var(--color-muted)] mt-1">
              ℹ️ Balance date will update to today when saved
            </p>
          )}
        </Field>

        <Field label="Accrual rate (hrs/pay period)">
          <TextInput type="number" step="0.01" value={form.accrualRateHours} onChange={e => set('accrualRateHours', e.target.value)} />
        </Field>

        <Field label="Pay period">
          <select
            value={form.payPeriodFrequency}
            onChange={e => set('payPeriodFrequency', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="biweekly">Every two weeks</option>
            <option value="semi-monthly">Twice a month (1st & 15th)</option>
          </select>
        </Field>

        {form.payPeriodFrequency === 'biweekly' && (
          <Field label="Anchor pay date">
            <TextInput type="date" value={form.payPeriodAnchorDate || ''} onChange={e => set('payPeriodAnchorDate', e.target.value)} />
          </Field>
        )}

        {form.employmentType === 'part-time' && (
          <div>
            <div className="text-sm font-medium text-[var(--color-muted)] mb-2">Weekly schedule</div>
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3 mb-2">
                <span className="w-10 text-sm text-[var(--color-muted)]">{DAY_LABELS[day]}</span>
                <TextInput
                  type="number"
                  min="0"
                  max="16"
                  step="0.25"
                  value={form.schedule[day] ?? 0}
                  onChange={e => setScheduleDay(day, e.target.value)}
                />
                <span className="text-sm text-[var(--color-muted)]">hrs</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl mt-2"
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Trips section */}
      {trips.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-[var(--color-text)] mb-3">Planned Trips</h2>
          {trips.map(trip => (
            <div key={trip.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-medium text-sm">{trip.name || `Trip on ${trip.startDate}`}</div>
                <div className="text-xs text-[var(--color-muted)]">{trip.startDate} – {trip.endDate}</div>
              </div>
              <button
                onClick={() => handleDeleteTrip(trip.id)}
                className="text-[var(--color-danger)] text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reset */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-[var(--color-text)] mb-2">Danger Zone</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">
          Reset all data and start over. This cannot be undone.
        </p>
        <button
          onClick={handleReset}
          className="w-full border border-[var(--color-danger)] text-[var(--color-danger)] font-medium py-3 rounded-xl"
        >
          Reset Everything
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test manually**

Open Settings. Change balance — verify "balance date will update to today" note appears. Save. Switch to Timeline and verify projections use the updated date. Test delete trip. Test reset (with cancel, then confirm).

- [ ] **Step 3: Commit**

```bash
git add src/views/Settings.jsx
git commit -m "feat: implement settings screen with profile edit and trip management"
```

---

## Chunk 10: PWA + iOS Install Prompt

**Files:**
- Create: `manifest.json`, `public/sw.js`
- Replace stub: `src/components/InstallPrompt.jsx`

### Task 12: PWA manifest and service worker

- [ ] **Step 1: Create `manifest.json`** (project root):

```json
{
  "name": "PTO Tracker",
  "short_name": "PTO",
  "description": "Track your PTO balance and plan vacations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf5ff",
  "theme_color": "#7c3aed",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Create app icons**

Create `public/icons/` directory. Add two square purple PNG icons (192×192 and 512×512).

Quick option: Go to [favicon.io/emoji-favicons](https://favicon.io/emoji-favicons/) → search "airplane" → download → rename the PNGs to `icon-192.png` and `icon-512.png` and place in `public/icons/`. Alternatively, the `frontend-design` skill can generate the icon artwork. The icon background should use the app's purple (`#7c3aed`).

- [ ] **Step 3: Create `public/sw.js`** (service worker):

```js
const CACHE_NAME = 'pto-tracker-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  )
})
```

- [ ] **Step 4: Register service worker in `src/main.jsx`** — add after ReactDOM.createRoot:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  })
}
```

- [ ] **Step 5: Implement `src/components/InstallPrompt.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { isInstallDismissed, dismissInstall } from '../logic/storage'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS Safari, not already dismissed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIOS && !isStandalone && !isInstallDismissed()) {
      // Show after a short delay on first visit
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  function handleDismiss() {
    dismissInstall()
    setShow(false)
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-purple-100 p-5 z-40 animate-slide-up">
      <div className="flex justify-between items-start mb-3">
        <div className="font-bold text-[var(--color-text)]">Add to Home Screen 📲</div>
        <button onClick={handleDismiss} className="text-[var(--color-muted)] text-lg leading-none">✕</button>
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-3">
        Install this app on your iPhone for the best experience — it'll work like a native app!
      </p>
      <div className="flex items-center gap-2 text-sm text-[var(--color-text)] bg-purple-50 rounded-xl p-3">
        <span>1️⃣</span>
        <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--color-text)] bg-purple-50 rounded-xl p-3 mt-2">
        <span>2️⃣</span>
        <span>Select <strong>"Add to Home Screen"</strong></span>
      </div>
      <button onClick={handleDismiss} className="w-full mt-4 text-sm text-[var(--color-muted)] underline">
        Maybe later
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Add slide-up animation to Tailwind config**

In `tailwind.config.js`, extend:
```js
theme: {
  extend: {
    keyframes: {
      'slide-up': { '0%': { transform: 'translateY(100%)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
    },
    animation: {
      'slide-up': 'slide-up 0.3s ease-out',
    },
  },
},
```

- [ ] **Step 7: Test PWA on iPhone**

```bash
npm run build && npm run preview
```

Open preview URL in iPhone Safari. Verify:
- Install prompt appears after 2 seconds
- "Add to Home Screen" instructions are clear
- After adding, app opens in full-screen standalone mode
- Data persists after closing and reopening

- [ ] **Step 8: Commit**

```bash
git add manifest.json public/ src/components/InstallPrompt.jsx src/main.jsx tailwind.config.js
git commit -m "feat: add PWA manifest, service worker, and iOS install prompt"
```

---

## Chunk 11: Deployment

**Files:**
- Create: `netlify.toml`

### Task 13: Deploy to Netlify

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/pto-tracker.git
git branch -M main
git push -u origin main
```

(Create the GitHub repo first at github.com/new — name it `pto-tracker`, keep it private)

- [ ] **Step 3: Connect to Netlify**

1. Go to [netlify.com](https://netlify.com) → Log in / Sign up (free)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub → Select `pto-tracker` repo
4. Build settings auto-detected from `netlify.toml`
5. Click "Deploy site"

Expected: Site deploys at `https://random-name.netlify.app` within ~2 minutes.

- [ ] **Step 4: (Optional) Rename site**

In Netlify → Site settings → Site name → Change to `pto-tracker-[initials]` or similar.

- [ ] **Step 5: Share URL with Gaby**

Send Gaby and her 5 colleagues the Netlify URL. Each person:
1. Opens the URL in iPhone Safari
2. Taps Share → Add to Home Screen
3. Completes the 2-minute onboarding wizard
4. They're ready to plan trips!

- [ ] **Step 6: Final commit**

```bash
git add netlify.toml
git commit -m "feat: add Netlify deployment config"
git push
```

---

## Verification Checklist

Run these end-to-end tests on iPhone (Safari + Add to Home Screen) before declaring done:

- [ ] **Onboarding (full-time):** Set up full-time profile, confirm data saves correctly
- [ ] **Onboarding (part-time):** Set up Mon 4.75h, Tue 6h, Thu 7.5h — confirm all steps work
- [ ] **Trip cost math:** Plan Mon–Thu (no holiday) as part-time → should = 18.25 hrs exactly
- [ ] **Federal holiday:** Plan a range including July 3 2026 (observed Independence Day) — confirm 0 hrs for that day, cost reduced
- [ ] **Multi-trip projection:** Add 2 trips, verify 2nd trip's "balance going in" accounts for 1st trip
- [ ] **Balance going in vs after:** Balance shown in Plan a Trip = balance *before* this trip is deducted
- [ ] **Settings balance edit:** Edit balance → "balance date will update" note shows → save → timeline projections recalculate
- [ ] **Negative balance:** Plan trips that exceed balance → shows negative in red, doesn't block planning
- [ ] **Timeline:** Accruals show on correct pay dates, running balance is accurate, 18-month window
- [ ] **Offline:** Disable wifi → reload → app works, data intact
- [ ] **Dual-unit display:** Every balance in the entire app shows both days AND hours
- [ ] **iOS install prompt:** First launch shows prompt, dismiss and remember works
