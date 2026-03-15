# PTO Accrual & Vacation Planning Tool — Design Spec
**Date:** 2026-03-15
**Status:** Reviewed & Updated

---

## Context

Gaby (part-time Child Life Specialist) and 5 full-time colleagues at a hospital need a way to track their PTO balances and plan future vacations with confidence. Currently they have no easy way to answer questions like "If I take a long weekend in May, will I still have enough for a full week in August?" The app solves this by projecting their running PTO balance forward in time, accounting for ongoing accrual and planned trips.

V1 is individual — each person tracks their own PTO on their own device. V2 (future) adds shared team visibility so colleagues can see each other's planned time off.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | PWA-capable, component-based, fast to build |
| Styling | Tailwind CSS | Mobile-first, responsive, utility-based |
| Data | localStorage | No backend needed for V1, persists on device |
| Deployment | Netlify (free) | Auto-deploys from GitHub, free custom subdomain |
| Design | frontend-design skill | Distinctive, fun, travel-app aesthetic — NOT generic |

**NOT:** Python/Streamlit (not mobile-friendly, not PWA-capable)

---

## Users

- **Gaby** — part-time, custom weekly schedule (varying hours per day)
- **5 colleagues** — all full-time (37.5 hrs/week, 7.5 hrs/day, Mon–Fri)
- Each user sets up their own profile on their own device
- App installed as PWA via Safari → Add to Home Screen on iPhone

---

## Aesthetic Direction

Fun, warm, and exciting — feels like a travel planning app, not an HR system. Reference: option B from brainstorm (warm purples, rounded cards, playful). Use the `frontend-design` skill during implementation to ensure it's distinctive and memorable, not generic. Vibe: you're planning adventures, not filing paperwork.

---

## Screens & Navigation

Bottom tab bar: **Home · Timeline · Settings**
"Plan a Trip" opens as a full-screen overlay from Home.

### 1. Onboarding (first launch only)
Step-by-step setup wizard:
1. Welcome + name
2. Employment type (full-time or part-time)
3. If part-time: enter hours for each working day (Mon–Fri, 0 = day off). **Note:** V1 only supports Mon–Fri schedules. Non-standard weeks (e.g. Tue–Sat) are a known limitation.
4. Current PTO balance in hours + today's date (auto-filled, editable)
5. Pay period: frequency (`biweekly` or `semi-monthly`) + anchor date
   - **Biweekly:** a known past pay date; app steps forward every 14 days
   - **Semi-monthly:** automatically 1st and 15th of each month (no anchor date needed)
6. Accrual rate: hours earned per pay period

**Input validation:**
- Balance: must be ≥ 0, numeric, max 9999 hrs (catches "375" instead of "3.75")
- Accrual rate: must be > 0, numeric, max 99 hrs/period
- Part-time schedule: at least 1 day must have hours > 0; each day 0–24 hrs
- Anchor date (biweekly): must be in the past or today
- All fields required before advancing

### 2. Home — Balance Hero (main screen)
- Large, prominent current PTO balance displayed as **both** days and hours (e.g. "12.5 days · 93.75 hrs")
- "Plan a Trip ✈️" button — prominent CTA
- List of planned upcoming trips (sorted by start date), each showing:
  - Date range + trip name (or "Trip on [start date]" if unnamed)
  - PTO cost (days + hours)
  - Projected balance *after* that trip completes
- Empty state if no trips: fun, encouraging ("Where will you go first? 🌍")

### 3. Plan a Trip (full-screen overlay)
- Tap-based calendar range picker (tap start date, then tap end date)
- As user selects range, live preview shows:
  - Working days selected (skipping weekends, non-scheduled days for part-time, federal holidays)
  - Federal holidays in range highlighted and labeled "free day 🎉"
  - PTO cost in days + hours
  - Projected balance **on the trip start date, before this trip is deducted** (i.e. what you'll have going into the trip)
  - Green check if balance ≥ trip cost / red warning if not
- Optional: name the trip (placeholder: "Beach trip", "Family visit", etc.)
- Confirm button adds trip to the list

### 4. Timeline
Chronological, scrollable list from today forward (18-month window, hardcoded):
- Each row: date · event type · running balance
- Event types:
  - **Accrual** (+X hrs · running balance) — green
  - **Trip** (trip name · –X hrs · running balance) — purple
  - **Today** marker at top — neutral
- Running balance shown after every event in both days + hours
- Empty state (no trips, fresh profile): "Your adventure timeline starts here ✈️" + link to Plan a Trip

### 5. Settings
- Edit all profile fields (name, type, schedule, balance, pay period, accrual rate)
  - **When balance is edited**, `balanceAsOfDate` automatically updates to today — shown to the user explicitly ("Balance updated as of today, March 15")
- Edit or delete individual planned trips
- "Reset everything" option (with confirmation dialog)

---

## Data Model (localStorage)

```json
{
  "profile": {
    "name": "Gaby",
    "employmentType": "part-time",
    "schedule": {
      "monday": 4.75,
      "tuesday": 6,
      "wednesday": 0,
      "thursday": 7.5,
      "friday": 0
    },
    "currentBalanceHours": 93.75,
    "balanceAsOfDate": "2026-03-15",
    "payPeriodFrequency": "biweekly",
    "payPeriodAnchorDate": "2026-03-07",
    "accrualRateHours": 3.75
  },
  "trips": [
    {
      "id": "uuid",
      "name": "Beach trip",
      "startDate": "2026-07-04",
      "endDate": "2026-07-08"
    }
  ]
}
```

**Note:** `hoursUsed` is NOT stored. It is always derived at runtime from `startDate`, `endDate`, and the current `profile`. This ensures trip costs stay correct if the user later edits their schedule.

---

## Core Calculations

### `getWorkingDayHours(date, profile)`
Returns hours for a given date:
- If date is a federal holiday → 0
- If full-time: Mon–Fri → 7.5, weekend → 0
- If part-time: look up `profile.schedule[dayOfWeek]` (already 0 for off days), weekend → 0

### `calculateTripCost(startDate, endDate, profile)`
Loop each date in range (inclusive), sum `getWorkingDayHours()` for each. Returns total hours. Always derived at runtime — never cached.

### `getPayPeriodDates(fromDate, toDate, profile)`
- **Biweekly:** Advance from `payPeriodAnchorDate` by 14-day steps to find the first pay date on or after `fromDate`, then continue stepping forward until past `toDate`. Return all dates within `fromDate`–`toDate`.
- **Semi-monthly:** Generate the 1st and 15th of every month between `fromDate` and `toDate`.

### `getProjectedBalance(targetDate, profile, trips)`
1. Start with `currentBalanceHours` (as of `balanceAsOfDate`)
2. Count pay periods strictly *after* `balanceAsOfDate` and *on or before* `targetDate` → multiply by `accrualRateHours`
   - **Boundary rule:** If a pay period date equals `targetDate`, the accrual IS included (accrual happens before the day is "consumed")
3. Subtract `calculateTripCost()` for all trips with `startDate` strictly *before* `targetDate`
   - **Boundary rule:** If a trip starts on `targetDate`, it is NOT yet deducted (the projected balance is "going into the trip")
   - **Lump-sum deduction:** A trip's full cost is deducted at `startDate`. PTO is not distributed across individual days of the trip.
4. Return projected balance in hours

**Can return negative values** — this is intentional and shown as a warning (e.g. "–2.5 days / –18.75 hrs — you'd be short").

### `buildTimeline(profile, trips)`
Produce sorted array of events for the next 18 months from today:
- One entry per pay period date: `{ type: 'accrual', date, hours, runningBalance }`
- One entry per trip start: `{ type: 'trip', date, name, startDate, endDate, runningBalance }`
- Running balance after each event calculated sequentially using the boundary rules above

---

## Display Rules

**Always show both units simultaneously:**
`12.5 days / 93.75 hrs`

**Day conversion:**
- Full-time: hours ÷ 7.5
- Part-time: hours ÷ (total scheduled hours per week ÷ 5)
  - Example: Gaby works 4.75 + 6 + 0 + 7.5 + 0 = 18.25 hrs/week → 18.25 ÷ 5 = 3.65 hrs/day denominator
  - This is the "FTE-equivalent day length" — consistent with how most hospital PTO systems convert

Use decimals (e.g. "12.5 days"), never round to whole days.

---

## Federal Holidays

Hardcoded list for **2025–2028** (4 years of coverage). This covers all practical planning horizons at launch. When the app is updated in late 2027, extend to 2029+.

Holidays covered: New Year's Day, MLK Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas.

**Out-of-range behavior:** If a date falls outside the covered range, treat it as a regular workday (no silent miscounting — log a console warning).

---

## PWA Setup

- `manifest.json`: name, short_name, icons, theme_color (purple), display: standalone
- Service worker: cache app shell for offline use
- iOS meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- **Install prompt:** Safari on iOS does NOT support the `beforeinstallprompt` event. Instead, show a custom bottom sheet on first launch with instructions: "Add this to your Home Screen — tap the Share button, then 'Add to Home Screen'" with a diagram. Dismiss and remember in localStorage.

---

## File Structure

```
/
├── index.html
├── manifest.json
├── public/
│   └── icons/              # PWA icons (various sizes)
├── src/
│   ├── main.jsx
│   ├── App.jsx             # Root, view switching via state
│   ├── views/
│   │   ├── Onboarding.jsx
│   │   ├── Home.jsx
│   │   ├── PlanTrip.jsx
│   │   ├── Timeline.jsx
│   │   └── Settings.jsx
│   ├── components/
│   │   ├── BalanceDisplay.jsx    # Always-dual-unit display
│   │   ├── TripCard.jsx
│   │   ├── CalendarPicker.jsx
│   │   └── BottomNav.jsx
│   ├── logic/
│   │   ├── calculations.js       # All PTO math
│   │   ├── holidays.js           # Federal holiday list 2025–2028
│   │   └── storage.js            # localStorage helpers
│   └── styles/
│       └── index.css
├── CLAUDE.md
├── OPEN_QUESTIONS.md
├── FUTURE_FEATURE_IDEAS.md
└── docs/
    └── superpowers/specs/
        └── 2026-03-15-pto-tracker-design.md
```

---

## Project Files to Create at Implementation Start

**`CLAUDE.md`** — project context for future sessions (stack, key files, known gotchas)

**`OPEN_QUESTIONS.md`** — seeded with:
1. Does PTO accrue during vacation time? *(assumed yes for now — verify with hospital HR)*
2. What are the actual accrual rates (full-time vs. part-time)?
3. What is the exact pay period frequency and anchor date used at the hospital?

**`FUTURE_FEATURE_IDEAS.md`** — seeded with:
- V2: Shared team calendar — see each colleague's planned time off on the date picker
- V2: Outlook/Google Calendar integration for team PTO dots
- V2: Backend/cloud sync so data survives phone replacement

---

## Known Limitations (V1)

- **Mon–Fri schedules only** — Tue–Sat or other non-standard hospital schedules not supported
- **No data backup** — data lives in browser localStorage; clearing browser data wipes it
- **Single user per device** — no login, no profiles; each device = one person
- **Holiday list expires** — hardcoded through 2028; needs annual maintenance after that

---

## V2 Notes (do not build yet)

- Multi-user backend (Supabase or similar) with login
- Shared availability calendar — colleagues can see each other's planned trips
- Calendar integration (Outlook/Google) for team dots on date picker
- Cloud sync / data backup

---

## Verification

After build, test these scenarios end-to-end on iPhone (Safari + Add to Home Screen):

1. **Onboarding (full-time):** Set up a full-time profile, confirm balance/pay period saves correctly
2. **Onboarding (part-time):** Set up Gaby's schedule (Mon 4.75h, Tue 6h, Thu 7.5h), confirm trip cost for a Mon–Thu range = 4.75 + 6 + 0 + 7.5 = 18.25 hrs
3. **Plan a trip with holiday:** Select July 4–8, 2026 — confirm July 4 (Independence Day) shows as free, hours reduced by 7.5 (full-time) or the scheduled day amount (part-time)
4. **Multi-trip:** Add 2 trips, confirm the second trip's projected balance accounts for the first trip's deduction
5. **Balance on trip start:** Projected balance shown in Plan a Trip = balance *before* this trip, not after
6. **Balance edit in Settings:** Edit balance → confirm `balanceAsOfDate` updates to today and downstream projections recalculate correctly
7. **Timeline:** Verify accrual events appear on correct pay dates, running balance is accurate, 18-month window
8. **Negative balance warning:** Plan trips that exceed balance — confirm app shows negative balance as a warning, not an error that blocks planning
9. **Offline:** Disable wifi, reload — confirm app still works and data is intact
10. **Display:** Every balance shown anywhere in the app shows both days AND hours simultaneously
11. **iOS install prompt:** First launch shows custom "Add to Home Screen" instruction sheet
