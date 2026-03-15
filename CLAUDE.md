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
