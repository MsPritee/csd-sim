# Digital Logic Concept Lab

An interactive Digital Logic **learning platform** that teaches students *why* digital circuits work.

See [PLAN.md](./PLAN.md) for the full product roadmap and architecture.

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · Zustand · SVG · Framer Motion · Vitest · RTL · Playwright

## Repository Layout

The project follows a strict 4-layer architecture: **Presentation → Application → Educational Engine → Logic Engine**. The UI never implements math, and the lower layers stay framework-independent.

```
src/
├── application/  # orchestration / use-cases (wires core + education, no math)
├── core/         # logic engines (pure TS, no UI)
├── education/    # educational engine (concepts / lessons / hints / misconceptions)
├── simulators/   # presentation (React UI: kmap, gates, adders, flipflops)
├── stores/       # Zustand state
└── tests/        # mirrors core/education/application/simulators
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Watch-mode tests |
| `npm run test:e2e` | Run Playwright E2E tests (Chromium) |

Continuous integration runs lint → audit → build → unit tests → E2E on every push/PR via GitHub Actions (see `.github/workflows/ci.yml`).

## Change Log

Every change is recorded in [CHANGELOG.md](./CHANGELOG.md), grouped by milestone (M0–M15).