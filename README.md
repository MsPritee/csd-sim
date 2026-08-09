# Digital Logic Concept Lab

An interactive Digital Logic **learning platform** that teaches students *why* digital circuits work.

See [PLAN.md](./PLAN.md) for the full product roadmap and architecture.

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · Zustand · SVG · Framer Motion · Vitest · RTL · Playwright (planned)

## Repository Layout

```
src/
├── core/        # logic engines (pure TS, no UI)
├── education/   # educational engine (concepts / lessons / hints / misconceptions)
├── simulators/  # UI simulators (kmap, gates, adders, flipflops)
├── components/
├── pages/
├── stores/
├── utils/
└── tests/
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

## Change Log

Every change is recorded in [CHANGELOG.md](./CHANGELOG.md), grouped by milestone (M0–M15).