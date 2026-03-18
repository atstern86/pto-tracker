# Session Log

---

## 2026-03-18 — Calendar Self-Dots, Unique Colleague Colors, Sync Delete Bug Fix

**What happened:**
- Added user's own trips as purple dots on the CalendarPicker
- Fixed colleague dot colors: index-based assignment guarantees uniqueness (was hash-based, caused collisions)
- Fixed bug: trip deletions were silently dropped if a sync was already in progress — `syncingRef` guard was updating `prevTripsRef` before bailing, so the deletion was never retried. Removed the guard; sync logic is idempotent so concurrent syncs are safe.

**What changed:**
- src/components/CalendarPicker.jsx — self-trip dots, index-based color assignment, updated legend
- src/views/PlanTrip.jsx — passes `tripsForCalc` as `trips` prop to CalendarPicker
- src/hooks/useSupabase.js — removed `syncingRef` guard that was silently dropping deletions

**What's next:**
- Alex MP should delete and re-add the stuck trip once they get the update prompt
- Restrict calendar to future dates only
- Replace placeholder icons
- Test on iPhone (full checklist)
- Get actual accrual rates + pay period details from Gaby

---

## 2026-03-17 — Deployment + Google OAuth Fixes (Session 2)

**What happened:**
- Switched from magic link auth to Google OAuth (Supabase email rate limit was 2/hr on free tier)
- Set up Google Cloud OAuth app (PTOtracker), published to production so app name shows
- Updated AuthPrompt: replaced email input with "Sign in with Google" button
- Changed connected state from permanent badge to 3-second dismissible success toast
- Deployed to Netlify — hit credit limit (20 deploys × 15 credits = 300, the free tier cap); upgraded Netlify plan
- Fixed Supabase Site URL + redirect URLs for production domain (was redirecting to localhost)
- Fixed service worker caching old app on desktop Chrome (unregister + hard refresh)
- Confirmed end-to-end two-user flow works: colleague dots appear on calendar for March 26–28
- PWA users need to delete + re-add app to get latest version (localStorage data is preserved)
- Added deployment checklist to global CLAUDE.md and memory: always call out env vars, auth URLs, OAuth redirect URIs after any deploy
- Added "Migrate Netlify → Railway" to TODO
- Logged cross-device sync as V2 idea in FUTURE_FEATURE_IDEAS.md

**What changed:**
- src/hooks/useSupabase.js — switched signIn to Google OAuth
- src/components/AuthPrompt.jsx — Google button, temporary success toast
- Global ~/.claude/CLAUDE.md — added deployment dependency guardrail
- Memory — added feedback_deployment_checklist.md

**What's next:**
- Tell colleagues to reinstall PWA (delete + re-add from Safari)
- Calendar: restrict to future dates only
- Deploy to Railway (migrate off Netlify)
- Replace placeholder icons
- Test on iPhone (full checklist)

---

## 2026-03-17 — Colleague Vacation Visibility (Google OAuth + Supabase)

**What happened:**
- Brainstormed and designed colleague visibility feature — colleagues see colored dots on the calendar when others have time off
- Set up Supabase backend: profiles + shared_absences tables with RLS, Realtime enabled
- Built full sync layer: supabase.js client, supabaseSync.js (sync/fetch/migrate), useSupabase.js hook
- Added AuthPrompt component, CalendarPicker colleague dots + legend, Settings account section
- Fixed infinite Realtime loop bug (filtered subscription to other users only, added debounce + serialized trips comparison)
- Hit Supabase built-in email rate limit (2/hour) during testing — explored Resend SMTP as fix
- Switched from magic link auth to Google OAuth — much better UX, no email rate limits
- Set up Google Cloud OAuth app (PTOtracker), enabled in Supabase, updated UI to "Sign in with Google" button
- AuthPrompt now shows temporary success toast on sign-in instead of permanent badge
- Tested two-user flow end-to-end — working

**What changed:**
- New files: supabase.js, supabaseSync.js, useSupabase.js, AuthPrompt.jsx, .env, .env.example
- Modified: App.jsx, CalendarPicker.jsx, Home.jsx, PlanTrip.jsx, Settings.jsx, storage.js, .gitignore
- Supabase project configured: DB schema, RLS, Realtime, Google OAuth provider
- Google Cloud OAuth app created and published to production

**What's next:**
- Calendar: restrict to future dates only
- Deploy to Netlify (set Supabase env vars in dashboard)
- Replace placeholder icons
- Test on iPhone

---

## 2026-03-17 — Home Page Edit/Delete Buttons

**What happened:** Added edit and delete buttons to trip cards on the home page, matching the timeline's UI.

**What was built/fixed:**
- TripCard component now shows `✏️ Edit` (purple) and `🗑️` (red) buttons instead of the old plain `✕`
- Edit button opens the PlanTrip overlay in edit mode (same flow as timeline)
- Wired through Home → App via `onEditTrip` prop

**What's next:**
- Deploy to Netlify
- Replace placeholder icons
- Test on iPhone
- Get HR details from Gaby (accrual rates, anchor date)

---

## 2026-03-15 — Timeline Collapsible Groups + Pay Stub Review

**What happened:** Reviewed the app locally, clarified onboarding pay period question using Gaby's actual pay stub, and improved the Timeline view.

**What was built/fixed:**
- Timeline accrual stretches now collapse into a single summary row (date range, pay period count, total hours, balance after)
- Tap to expand → shows individual pay period cards; tap again to collapse
- Clear tap affordance: green-tinted border, rotating `›` chevron, "tap for details" / "tap to collapse" label
- Pay stub review: confirmed Gaby is on **bi-weekly** pay (every 2 weeks), pay date **03/12/2026** — not semi-monthly (1st & 15th) as the onboarding screenshot suggested

**What's next:**
- Deploy to Netlify
- Replace placeholder icons
- Test on iPhone
- Get HR details from Gaby (accrual rates, anchor date)

---

## 2026-03-15 — Full V1 Build Complete

**What happened:** Built the entire PTO Tracker app from scratch across two sessions.

**What was built:**
- Full React 19 + Vite 5 + Tailwind CSS 3 PWA
- 6-step onboarding wizard (full-time and part-time paths)
- Home screen with "Golden Hour Wanderlust" design — gradient hero, balance in days + hours, trip list
- Plan a Trip overlay with react-day-picker range calendar, federal holiday highlighting (green "free 🎉" labels per date), live balance preview
- Timeline view — 18-month chronological accrual/trip event list with running balances
- Settings screen — edit all profile fields including employment type, with anchor date validation, balance date auto-update
- PWA manifest + service worker (cache-first, offline support)
- iOS-specific install prompt with visual diagram
- 48 automated tests covering all PTO calculation logic (TDD)
- netlify.toml for one-click Netlify deployment

**Critical bugs caught and fixed (by final code review):**
- `buildTimeline` was double-counting accruals on pay days → fixed by starting forward events from tomorrow
- Timeline "Today" marker showed stale stored balance instead of projected balance → fixed
- Anchor date not cleared when switching to semi-monthly pay period → fixed
- New Year's 2028 had wrong observed date (Jan 2 → Dec 31 2027) → fixed
- Settings was missing anchor date validation (must be past/today) and employment type editor → fixed

**Late session update:** Alex provided the actual hospital holiday schedule for 2026. Updated `src/logic/holidays.js` for all 4 years: added Friday after Thanksgiving, removed Columbus Day and Veterans Day (not observed by hospital). 51 tests now passing.

**What's next:**
- Deploy to Netlify (see Task 13 in CLAUDE.md + netlify.toml)
- Share URL with Gaby and her 5 colleagues
- Walk through onboarding with Gaby to confirm accrual rate and pay period details (see OPEN_QUESTIONS.md)
- Get actual app icon artwork (current icons are placeholder 1×1 pixel PNGs)

---
