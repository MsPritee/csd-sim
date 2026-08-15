# DigiWorld — Digital Logic Concept Lab

An interactive Digital Logic **learning platform** that teaches students *why* digital circuits work.

See [PLAN.md](./PLAN.md) for the full product roadmap and architecture, and
[CIRCUIT-PARITY.md](./CIRCUIT-PARITY.md) for the Logisim.app-style Circuit
Designer roadmap.

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

## Features

### Number Systems Simulator
The Number Systems Simulator includes powerful visual features for enhanced learning:

- **Visual Conversion Modes**: Animated step-by-step visualizations of conversion processes
- **Multiple Conversion Methods**: Division method, position value method, and bit grouping
- **Interactive Animations**: Play/pause controls, adjustable speed, step-by-step navigation
- **Practice Mode**: Guided exercises with immediate feedback and difficulty levels
- **Exploration Mode**: Free experimentation with real-time conversions and method comparison
- **Educational Hints**: Context-sensitive guidance and explanations
- **Cross-System Comparison**: View values across all number systems simultaneously

### Visual Features Benefits
- **Enhanced Understanding**: Visual representations make abstract concepts concrete
- **Improved Retention**: Multisensory encoding creates stronger memory traces
- **Increased Engagement**: Interactive elements maintain learner motivation
- **Personalized Learning**: Multiple pathways accommodate diverse learning styles

For detailed information about visual features, see [VISUAL_FEATURES_GUIDE.md](./VISUAL_FEATURES_GUIDE.md) and [EDUCATIONAL_BENEFITS.md](./EDUCATIONAL_BENEFITS.md).

## Change Log

Every change is recorded in [CHANGELOG.md](./CHANGELOG.md), grouped by milestone (M0–M15).