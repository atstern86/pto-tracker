# Session Log

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

**What's next:**
- Deploy to Netlify (see Task 13 in CLAUDE.md + netlify.toml)
- Share URL with Gaby and her 5 colleagues
- Walk through onboarding with Gaby to confirm accrual rate and pay period details (see OPEN_QUESTIONS.md)
- Get actual app icon artwork (current icons are placeholder 1×1 pixel PNGs)

---
