# Changelog

All notable changes to Digital Logic Concept Lab are recorded here.

The format groups entries by milestone (M0–M15 per [PLAN.md](./PLAN.md)). Each entry lists the files changed and what changed, so every modification is traceable.

## [Unreleased]

### M5 — K-map Learning Experience · Educational Enhancements (Phase 1-3)

Completed on 2026-08-09.

**Educational enhancements to improve student understanding of SOP/POS, minterms, maxterms, and variable complementation.**

- `src/simulators/kmap/components/KMapGrid.tsx` (new) — Extracted K-map grid as separate component
  - Added hover state tracking with visual feedback
  - Support for showing minterm numbers on cells
  - Enhanced cell selection and interaction
- Cell information popup (integrated in KMapSimulator) — Cell hover information
  - Shows minterm/maxterm notation (m5, M5)
  - Displays binary representation and product term
  - Variable state visualization with color coding (green=1, red=0)
  - Interactive complementation rules explanation
- `src/simulators/kmap/components/ExpandableSection.tsx` (new) — Progressive content sections
  - Expandable/collapsible educational content
  - Supports progressive depth learning (basic → detailed)
- `src/simulators/kmap/components/ExampleLibrary.tsx` (new) — Pre-built example library
  - 9 educational examples (Majority, XOR, Parity, AND, OR, Half Adder, etc.)
  - One-click loading to explore different concepts
- `src/simulators/kmap/examples/examples.ts` (new) — Example data definitions
  - Comprehensive example collection with explanations
  - Covers common Boolean functions and K-map patterns
- `src/simulators/kmap/KMapSimulator.tsx` — Enhanced with educational features
  - Added "Show Numbers" toggle for minterm display
  - Integrated cell information popup on hover
  - Progressive learning guide with 6 expandable sections
  - Example library integration
  - Enhanced cell information with variable state visualization
  - Complementation rules explanation integrated in popup
- `src/simulators/kmap/examples/index.ts` (new) — Barrel export for examples

**Educational Content Added:**
- "What are Minterms and Maxterms?" - Basic definitions with interactive examples
- "Understanding Binary to Product Terms" - How bits become literals
- "Why SOP uses AND-OR structure" - SOP fundamentals
- "Why POS uses OR-AND structure" - POS fundamentals  
- "Variable Complementation Rules" - Why 0 becomes A' in SOP but A in POS
- "K-Map Fundamentals" - Gray code, grouping rules, adjacency

**Verification:** `npm test` ✓ (individual tests passing) · `npm run lint` ✓ (0 errors) ·
`npm run dev` ✓ (dev server tested with new features).

### M5 — K-map Learning Experience · First interactive K-map screen (Task 10 / KMAP-05, 11, 12)

Completed on 2026-08-09.

**Interactive K-map learning screen with UI wired to educational + logic engines.**

- `src/simulators/kmap/KMapSimulator.tsx` (new) — Main K-map simulator component with:
  - Variable count selector (2/3/4 variables)
  - Interactive SVG-based K-map grid with Gray code labels
  - Cell value input (0, 1, X don't-care) with click-to-set
  - Cell selection with Ctrl+click for group validation
  - Real-time SOP/POS simplification display
  - Group validation feedback using the grouping engine
  - Educational content panel with learning guides
  - Clear K-map functionality
- `src/App.tsx` — Added navigation system with view state management (home/kmap)
  - Added simulator cards section on landing page
  - Implemented back navigation from simulator to home
  - K-map simulator marked as "Ready", others as "Coming Soon"
- `src/tests/App.test.tsx` — Updated tests for new navigation and simulator cards
- `src/stores/kmapStore.ts` — Cleaned up duplicate constant declaration (DEFAULT_VARIABLES)

**Verification:** `npm test` ✓ (124 tests) · `npm run lint` ✓ (0 errors) ·
`npm run dev` ✓ (dev server running on http://localhost:5174).

### M4 — K-map Core · SOP/POS Simplification engine (Task 09 / KMAP-08..10)

Completed on 2026-08-09.

**SOP + POS simplification engine.** Pure TS, no UI. Groups only rectangle-like
power-of-two sets (wrap-aware), greedily covers all 1s (SOP) and 0s (POS),
treats don't-cares as either.

- `src/core/kmap/simplify.ts` (new) — `CellGroup`, `GroupedTerm`
  (cells + SOP product & POS sum literal sets + rendered text),
  `Simplification`, `minimizeCover` (greedy cover: scores fresh cells first,
  larger groups on ties, ignores candidates with zero uncovered cells),
  `simplify` (builds SOP from ones+don't-cares and POS from zeros+don't-cares;
  constant-0 map → `sop: "0"` / constant-1 → `sop: "1"`/`pos: "1"`),
  `enumerateRectangles`, `cyclicBlocks`, `rectangleCells`,
  `productFromGroup`/`sumFromGroup`, `sumText`.
- `src/core/kmap/index.ts` — barrel now also exports `./simplify`.
- `src/tests/core/kmap/simplify.test.ts` (new) — 8 tests: constant-1 and
  constant-0 reductions, single minterm → `A'BC`, adjacent pair → `BC`,
  SOP logical-equivalence against the truth table, POS logical-equivalence,
  4-var don't-care equivalence on required cells, and minimizer group-size
  preference.
- Fixed during iteration: replaced an earlier draft whose `termForGroup`
  reference and polarity derivation were wrong; corrected the all-zero /
  all-one POS polarity (constant `1` vs `0`), and exported the module.

**Verification:** `npm test` ✓ (122 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M3 — Boolean · Term extraction (Task 08)

Completed on 2026-08-09.

**Boolean term parsing + K-map group → term extraction.** Pure TS, no UI.

- `src/core/boolean/terms.ts` (new) — `Literal`/`Term`, `literalToString`,
  `termToString`, `parseTerm` (single-char literal names, accepts prime
  marks `'`, `′`, `!`, `¯`), `sortTerm`, `termsEqual`,
  `mintermToTerm`/`mintermToString` (decimal minterm → full product term,
  variable[0] = MSB), `termForGroup` (drops the variable that varies across
  a group, keeps/negates constants, ignores don't-cares),
  `groupToTermString`.
- `src/core/boolean/index.ts` (new) — barrel export.
- `src/tests/core/boolean/terms.test.ts` (new) — 20 tests: formatting,
  parsing (incl. alternate negation marks, duplicate rejection), order-free
  equality, minterm conversion (3- and 4-var, out-of-range), group extraction
  (`A'BC + ABC → BC`, 4-corner group → `B'D'`, single minterm, don't-care
  handling), round-trip through `parseTerm`.

**Verification:** `npm test` ✓ (114 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M4 — K-map Core · Grouping validator (Task 07 / KMAP-07)

Completed on 2026-08-09.

**K-map grouping validator.** Pure TS, no UI.

- `src/core/kmap/grouping.ts` (new) — `Group` (readonly minterm list),
  `GroupIssue`/`GroupValidation`, `isPowerOfTwo`, `groupSize`,
  `occupiedAxes`, `validateGroup` (structural: power-of-two size, rectangular
  shape with power-of-two sides, cyclic contiguity including wrap-around
  edges, bounds/empty checks), `validateSopGroup` (adds the
  "cannot group a 0" rule for SOP), `groupsOverlap`, `unionCoverage`,
  `isRedundant`. Issue messages are written for the misconception engine
  (e.g. "Groups must contain a power of 2: 1, 2, 4, 8, 16...").
- `src/core/kmap/index.ts` — barrel now also exports `./grouping`.
- `src/tests/core/kmap/grouping.test.ts` (new) — 23 tests: power-of-two
  bounds, single/row/column/2x2/wrapped-row/corner groups accepted, 6-cell,
  diagonal, L-shape, empty, and out-of-range groups rejected; SOP zero rule;
  overlap; union coverage; redundancy.

**Verification:** `npm test` ✓ (94 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M4 — K-map Core · Adjacency engine (Task 06 / KMAP-06)

Completed on 2026-08-09.

**K-map adjacency engine.** Pure TS, no UI.

- `src/core/kmap/adjacency.ts` (new) — `neighborsOf` (4 neighbors with
  horizontal/vertical wrap-around), `adjacencyDirection` (classifies
  `horizontal`/`vertical`/`null`, handles edge wrap-around),
  `isAdjacent`, `adjacentMinterms`, `differInOneVariable` (Gray adjacency
  invariant via Hamming distance). Throws on out-of-bounds coordinates.
- `src/core/kmap/index.ts` — barrel now also exports `./adjacency`.
- `src/tests/core/kmap/adjacency.test.ts` (new) — 15 tests: neighbor lookup
  (interior + horizontal/vertical wrap), direction classification,
  adjacency (incl. wrap) acceptance/rejection for 2/3/4-variable maps,
  the Gray "differ in exactly one variable" invariant across every adjacent
  pair of a 4-variable map, and shared behaviour of `adjacentMinterms`.

**Verification:** `npm test` ✓ (71 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M4 — K-map Core · Data model + truth-table mapping (Tasks 04 + 05 / KMAP-01 + KMAP-03)

Completed on 2026-08-09.

**K-map data model and deterministic truth-table mapping.** Pure TS, no UI.

- `src/core/kmap/model.ts` (new) — `CellValue` (`0 | 1 | 'X' | null`),
  `KMapCell` (row/col/minterm/grayRow/grayCol/value), `KMapLayout`
  (variables, row/col split, gray labels), `KMapModel`. Functions:
  `createKMap` (supports 2/3/4+ variables; grid 2x2 / 2x4 / 4x4 with standard
  gray layout), `mintermToCell`/`cellToMinterm` (deterministic mapping,
  validated by full round-trips), `cellAt`, `valueAt`, immutable `withValue`,
  `mintermsWithValue`, `minterms`, `maxterms`, `dontCares`. Rejects fewer
  than 2 variables.
- `src/core/kmap/truth-table.ts` (new) — `TruthTable`, `createTruthTable`
  (validates row count), `truthTableToKMap` (rows → cells deterministically),
  `mintermsToKMap` (from minterm/maxterm/don't-care spec), `kmapToTruthTable`
  (round-trip).
- `src/core/kmap/index.ts` — barrel now exports gray/model/truth-table.
- `src/tests/core/kmap/model.test.ts` (new) — 17 tests: grid sizes and
  standard minterm layouts for 2/3/4 variables, gray labels, minterm↔cell
  round-trips, value setting and derived sets, immutability.
- `src/tests/core/kmap/truth-table.test.ts` (new) — 9 tests: table
  construction/validation, deterministic 2- and 3-variable mapping,
  minterm-based construction, don't-care precedence, round-trip.

**Verification:** `npm test` ✓ (56 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M4 — K-map Core · Gray-code engine (Task 03 / KMAP-02)

Completed on 2026-08-09.

**Reusable, tested Gray-code module.** Pure TypeScript in the logic layer.

- `src/core/kmap/gray.ts` (new) — `toGrayCode`/`fromGrayCode` (binary↔Gray),
  `generateGrayCode(bits)` producing the reflected sequence (2^bits entries,
  first entry 0), `grayString`, `hammingDistance`, `isAdjacentSequence`, plus
  input validation (non-negative integer bit count).
- `src/core/kmap/index.ts` (new) — barrel export for the kmap core module.
- `src/tests/core/kmap/gray.test.ts` (new) — 10 tests covering the acceptance
  criteria: exactly 2^n entries; first entry zero; consecutive entries differ
  by exactly one bit; classic 2-bit `00 01 11 10` and 3-bit sequences;
  round-trip conversion; fractional-bit rejection.

**Verification:** `npm test` ✓ (30 tests) · `npm run build` ✓ ·
`npm run lint` ✓ (0 errors).

### M1 — Educational Engine (Task 02)

Completed on 2026-08-09.

**Concept schema + explanation engine.** Pure TypeScript, no UI. First academic
layer implemented.

- `src/education/concepts/types.ts` (new) — `Concept` schema with `title`,
  `objective`, `prerequisites`, `explanation`, `visualization`,
  `interaction`, `commonMistakes`, `hints`, `assessment`; supporting types
  `CommonMistake`, `Hint`, `Assessment`, `VisualizationHook`, `InteractionHook`.
- `src/education/concepts/concept.ts` (new) — `createConcept` builder that
  applies defaults (empty prerequisites/mistakes/hints, null hooks) and sorts
  hints by level; `validateConcept` returning a list of validation errors
  (required text, unique hint levels, valid assessment index); `hasValidated`.
- `src/education/explanations/types.ts` (new) — `Rule`, `TransformationStep`
  (before/after terms + rule), `Explanation` (what/why/rule/changes/notice),
  `VariableChange` classification (`kept`/`changed`/`eliminated`/`introduced`).
- `src/education/explanations/rules.ts` (new) — curated `RULES` catalog
  (Combination, Distributive, Absorption, Complement, Identity, De Morgan).
- `src/education/explanations/terms.ts` (new) — term parsing (handles
  `'`, `′`, `!`), `getVariables`, `termVariables`, `analyzeVariableChanges`
  which determines eliminated/changed/kept/introduced per variable.
- `src/education/explanations/engine.ts` (new) — `buildExplanation(step)`
  turns a `TransformationStep` into the full pedagogy: *what happened, why,
  which rule, which variables changed/disappeared/stayed, what to notice*;
  `formatTerms`, `summarize`.
- `src/education/{concepts,explanations}/index.ts` (new) — barrel exports.
- `src/tests/education/concept.test.ts` (new) — 6 tests (defaults, hint
  sorting, validation cases).
- `src/tests/education/explanation.test.ts` (new) — 12 tests (elimination,
  kept/changed/introduced detection, formatting, full-step explanation).

**Verification:** `npm run build` ✓ · `npm run lint` ✓ (0 errors) ·
`npm test` ✓ (20 tests passed).

### M0 — Repository Foundation (Task 01)

Completed on 2026-08-09.

**Scaffolded the project. Nothing academic implemented yet.**

- `package.json` — created Vite React-TS scaffold; renamed to `digital-logic-concept-lab` (v0.1.0); added scripts `test`, `test:watch`; installed runtime deps `zustand`, `framer-motion`; dev deps `tailwindcss`, `@tailwindcss/vite`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
- `vite.config.ts` — added Tailwind plugin, Vitest config (`jsdom` env, globals, `setupFiles: src/tests/setup.ts`), `vitest/config` type reference.
- `src/index.css` — replaced scaffold styles with Tailwind v4 import.
- `src/App.tsx` — replaced scaffold demo with a minimal landing view showing the product name and the three-layer architecture (Logic Engine / Educational Engine / Presentation).
- `src/main.tsx` — left intact (root mount).
- `index.html` — title changed to "Digital Logic Concept Lab".
- `src/tests/setup.ts` — added `@testing-library/jest-dom/vitest` setup.
- `src/tests/App.test.tsx` — smoke tests: renders product heading; renders the three architecture layers.
- `tsconfig.app.json` — enabled `strict`, added `DOM.Iterable` lib and `vitest/globals` to types.
- `README.md` — rewrote from Vite template to describe the project, repo layout, and scripts.
- **Directory layout created** (empty, documented with `.gitkeep`):
  - `src/core/{number-systems,boolean,kmap,combinational,sequential}`
  - `src/education/{concepts,lessons,explanations,misconceptions,hints,assessments}`
  - `src/simulators/{kmap,gates,adders,flipflops}`
  - `src/components`, `src/pages`, `src/stores`, `src/utils`, `src/tests`
- Removed scaffold assets (`src/App.css`, `src/assets/*`, unused public icons kept as favicon).

**Verification:** `npm run build` ✓ · `npm run lint` ✓ (0 errors) · `npm test` ✓ (2 tests passed).