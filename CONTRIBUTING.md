# Contributing to Qatra

Thank you for working on the hackathon project. Please follow this so merges stay smooth.

## 1. Pick your area

See [docs/TEAM.md](./docs/TEAM.md) for folder ownership.

## 2. Branch naming

- `feature/map` — map
- `feature/chat` — chat
- `feature/firebase` — Firebase
- `feature/api` — Node server
- `fix/...` — bugfixes

## 3. Commit messages

Use prefixes: `feat(map):`, `feat(chat):`, `feat(firebase):`, `fix:`, `docs:`

## 4. Pull request checklist

- [ ] I only changed files in my assigned area (or agreed with lead)
- [ ] `npm run build` succeeds
- [ ] I did not commit `.env.local` or database files
- [ ] I pulled latest `main` before pushing
- [ ] README in my feature folder updated if behavior changed

## 5. Code rules

- Use `data` from `src/services/data/index.js` for fetching (not raw `fetch` in pages)
- Keep shared components in `src/components/`
- Match existing Tailwind style (red-600, rounded-2xl, border-red-100)
- Bilingual strings go in `src/i18n/translations.js`

## 6. Review

Project lead merges PRs to `main`. One approval recommended before merge.
