# TODO

## Up Next

- [ ] **Calendar: restrict to future dates only** — don't allow selecting past dates when planning a trip
- [ ] **Share with Gaby** — tell colleagues to reinstall PWA (delete + re-add from Safari), data is preserved
- [ ] **Replace placeholder icons** — create proper 192×192 and 512×512 purple plane icons in `public/icons/`
- [ ] **Test on iPhone** — run through the verification checklist in the design spec (11 scenarios)
- [ ] **Get HR details from Gaby** — actual accrual rates, pay period frequency, anchor date (see OPEN_QUESTIONS.md)

## Infra
- [ ] **Migrate hosting from Netlify to Railway** — already on Railway for another app, avoid Netlify credit limits

## Future (V2)

See FUTURE_FEATURE_IDEAS.md

## Done

- [x] Calendar: show user's own trips as dots on CalendarPicker
- [x] Fix colleague dot colors — index-based assignment guarantees uniqueness
- [x] Fix sync bug: trip deletions were silently dropped if a sync was in progress
- [x] Timeline collapsible accrual groups (tap to expand/collapse, with clear affordance)
- [x] Scaffold Vite + React + Tailwind + Vitest
- [x] Project docs (CLAUDE.md, OPEN_QUESTIONS.md, FUTURE_FEATURE_IDEAS.md)
- [x] Federal holiday list 2025–2028 (TDD)
- [x] localStorage helpers (TDD)
- [x] PTO calculation engine (TDD, 48 tests)
- [x] App shell + navigation (BottomNav, view routing)
- [x] 6-step onboarding wizard
- [x] Home screen (Balance Hero, trip list, "Golden Hour Wanderlust" design)
- [x] Plan a Trip overlay (calendar, holiday highlighting, live preview)
- [x] Timeline view (chronological events, running balances)
- [x] Settings screen (full profile edit, validation, trip management)
- [x] PWA manifest + service worker + iOS install prompt
- [x] netlify.toml deployment config
- [x] Home page trip cards — edit/delete buttons (matching timeline UI)
- [x] Colleague vacation visibility — Supabase backend, Google OAuth, calendar dots, realtime sync
