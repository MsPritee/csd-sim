# Digital Logic Concept Lab — Master Plan

## Product Goal

An interactive Digital Logic **learning platform** that teaches students *why* digital circuits work, then lets them experiment, construct, solve, and verify.

**Not** a simulator that follows `Input → Simulator → Output`.

Every concept must follow:

```
WHY? → CONCEPT → VISUALIZATION → INTERACTION → EXPERIMENT → PRACTICE → CHALLENGE
```

## Learning Modes

Every major module should eventually support: **Learn, Explore, Build, Solve, Challenge**.

## Curriculum Domains

```
DIGITAL LOGIC CONCEPT LAB
    ├── NUMBER SYSTEMS
    ├── BOOLEAN ALGEBRA
    ├── K-MAPS          ← flagship module
    ├── COMBINATIONAL LOGIC
    ├── SEQUENTIAL LOGIC
    └── DIGITAL SYSTEM DESIGN
```

## Core Architecture

Three strict layers. The UI must **never** implement math logic directly.

```
┌───────────────────────────────────┐
│         PRESENTATION              │ React / SVG / Animations / UI
├───────────────────────────────────┤
│         EDUCATIONAL ENGINE        │ Why / Hints / Mistakes / Steps
├───────────────────────────────────┤
│         LOGIC ENGINE              │ Boolean / K-map / Circuits
└───────────────────────────────────┘
```

This layering lets the same engines serve: simulator, practice, exams, teacher assignments, AI tutor, auto-grading, and analytics.

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Rendering | SVG |
| Motion | Framer Motion |
| Tests | Vitest + React Testing Library + Playwright |
| Backend | None for the initial version (defer unless accounts/progress/analytics are needed) |

## Repository Structure

```
src/
├── core/            # logic engines (pure TS, no UI)
│   ├── number-systems/
│   ├── boolean/
│   ├── kmap/
│   ├── combinational/
│   └── sequential/
├── education/       # educational engine (concepts/lessons/explanation/misconceptions/hints/assessment)
├── simulators/      # UI simulators
├── components/
├── pages/
├── stores/
├── utils/
└── tests/
```

## Educational Engine

Each concept carries: `title, objective, prerequisite, explanation, visualization, interaction, common mistakes, hints, assessment`.

The explanation engine answers: *What happened? Why? Which rule? Which variables changed/disappeared? What should the student notice?*

The misconception engine validates student action and explains the why (e.g., "Invalid group — K-map groups must contain powers of 2: 1, 2, 4, 8, 16...").

## Milestones (M0 → M15)

| MS | Name |
|----|------|
| M0 | Repository Foundation |
| M1 | Educational Engine |
| M2 | Number Systems |
| M3 | Boolean Algebra |
| M4 | K-map Core |
| M5 | K-map Visualization |
| M6 | K-map Learning Experience |
| M7 | K-map Practice |
| M8 | Logic Gates |
| M9 | Combinational Circuits |
| M10 | Sequential Circuits |
| M11 | Registers & Counters |
| M12 | FSM |
| M13 | AI Tutor |
| M14 | Teacher Platform |
| M15 | Production Release |

## Immediate Focus — K-map MVP

```
        K-MAP MVP
            ↓
   CORE ENGINE        LEARNING ENGINE
   Gray Code          "Why K-map?"
   Mapping            "Why Gray Code?"
   Adjacency          "Why Grouping?"
   Grouping           "Why Variables Disappear?"
   SOP                Mistake Detection
   POS
   Don't Care
            ↓
        K-MAP UI
            ↓
     GUIDED PRACTICE
            ↓
      CHALLENGE MODE
```

### K-map sub-phases

1. **KMAP-01** Data model — variables, minterms, maxterms, values, don't-cares, cell coordinates, Gray-code positions (2/3/4 variables). Pure TS engine, no UI.
2. **KMAP-02** Gray-code engine — n-bit Gray code, consecutive entries differ by exactly one bit; first entry is zero. Fully tested.
3. **KMAP-03** Truth-table → K-map mapping engine. Deterministic and fully tested.
4. **KMAP-04** The "Why?" experience — interactive lesson showing binary ordering (00→01→10→11 ❌) vs Gray ordering (00→01→11→10 ✅), adjacency ⇒ simplification.
5. **KMAP-05** Interactive K-map visualization component (2/3/4-var) — labels, hover, click, selection, animation.
6. **KMAP-06** Adjacency engine — horizontal, vertical, and wrap-around adjacency, visualized.
7. **KMAP-07** Grouping engine/validator — power-of-two size, rectangular, adjacency, wrap-around, overlap, redundancy.
8. **KMAP-08** Variable-elimination lesson — `A'BC + ABC → BC` with animation of the changing variable disappearing.
9. **KMAP-09** SOP solver — pipeline `Truth Table → K-map → 1-grouping → Terms → SOP`.
10. **KMAP-10** POS solver — same pipeline over 0s / maxterms.
11. **KMAP-11** Don't-care engine — support `X`, use/ignore, compare with/without X.
12. **KMAP-12** Guided practice — Beginner/Intermediate/Advanced/Expert; hints, step validation, mistake detection, retry.
13. **KMAP-13** Challenge mode — randomized truth tables/minterms/don't-cares; evaluate logical equivalence, NOT just exact expression match (multiple valid minimal forms allowed).

## The First 10 Tasks (build order)

| # | Task | Deliverable |
|---|------|-------------|
| 01 | Initialize repository + architecture | production-ready empty skeleton with 3-layer structure |
| 02 | Educational concept/explanation model | concept schema + explanation engine |
| 03 | Gray-code engine | tested reusable module |
| 04 | K-map data model | tested engine |
| 05 | Truth-table → K-map mapping engine | tested engine |
| 06 | K-map adjacency engine | tested engine |
| 07 | K-map grouping validator | tested engine |
| 08 | Boolean term extraction | tested engine |
| 09 | SOP/POS simplification engine | tested engine |
| 10 | First interactive K-map learning screen | UI wired to educational + logic engines |

Animations, challenges, and AI tutoring are added only after the above are stable.

## Development Cycle (per task)

```
PLAN → IMPLEMENT ONE UNIT → TEST → REVIEW → INTEGRATE → DOCUMENT → NEXT UNIT
```

### Required structure for every AI task

1. **Context** — building an educational Digital Logic Concept Lab.
2. **Current architecture** — exactly what exists today.
3. **Current objective** — one objective only.
4. **Constraints** — e.g., do not touch unrelated modules; no backend deps; keep calculation logic separate from UI; add unit tests.
5. **Acceptance criteria** — measurable, e.g., "Gray-code generator must produce 2^n entries; consecutive entries differ by exactly one bit; first entry is zero; includes tests."
6. **Verification** — run tests, run build, report changed files, report test results, explain architectural impact.

## Later Phases (deferred, high level)

- **Phase 2 — Number Systems**: conversions, 1's/2's complement, binary arithmetic; show place-value decomposition (`16+8+1 → 11001`), not raw `25 = 11001`.
- **Phase 3 — Boolean Algebra**: gates and laws with interactive truth tables, transformation → simplification → verification.
- **Phase 5 — Logic Gates**: symbol, truth table, Boolean expression, interactive inputs/output, "why it works" per gate.
- **Phase 6 — Combinational**: Half/Full Adder, Half/Full Subtractor, Comparator, Encoder/Decoder, MUX/DEMUX, code converters, BCD adder — via `Problem → Truth Table → Expression → K-map → Simplification → Circuit → Simulation`.
- **Phase 7–9 — Sequential, Registers, Counters**: latches, flip-flops, clock/edge/setup/hold/propagation; SISO/PISO/PIPO; up/down/mod-N/ring/Johnson counters with timing diagrams.
- **Phase 10 — FSM**: state diagrams/tables, transitions, circuit implementation.
- **Phase 11 — Complete Laboratory**: e.g., guided MOD-6 synchronous counter from problem statement to verified circuit in a 10-step flow.
- **Phase 12 — AI Assistant**: AI explains using the engine's verified state only (no hallucination); e.g., "These cells are diagonal, so they aren't adjacent under K-map adjacency rules…".
- **Phase 13 — Student Analytics**: per-concept mastery detection (e.g., grouping 62%) → adaptive recommendations.
- **Phase 14 — Teacher Mode**: dashboards, class analytics, assignments with automatic evaluation.
- **Phase 15 — Lab Mode**: constraint-based design problems (e.g., "full adder using only NAND gates") with per-stage evaluation.

## Guardrails

- Introduce backend only when accounts/progress/teacher dashboards/question banks/analytics/cloud sync are actually required.
- Keep three-layer separation from day one.
- Write a test for every core engine unit.
- Never generate one large coupled "K-map simulator" — always one small verifiable unit at a time.