# Changelog

All notable changes to the Digital Logic Concept Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [Added]
- **Component**: Circuit designer UI Fidelity — Unit A, Logisim-shaped gate glyphs (2026-08-15)
- **Description**: Rewrote `GateGlyph` with authentic classic-Logisim drawing geometry (`PainterShaped`), replacing the full-height edge-to-edge bodies with Logisim-proportioned silhouettes that share a common output apex (`TIP = 104`) and input face (`LEFT = 38`) so stubs line up across all gate families. AND/NAND are true semicircular D-shapes; OR/NOR use the PATH_WIDE bell quadratics; XOR/XNOR add the tightened `width-10` bell plus a doubled left curve; NOT/BUFFER/CON gates use Logisim's compact triangle; ODD/EVEN parity is now the Logisim rectangle labelled `2k+1`/`2k` (not a trapezoid); NAND/NOR/XNOR/NOT/CON_INV carry a negation bubble tangent to the apex; CON_BUF/CON_INV draw their enable line turning up into the triangle; inside symbols follow Logisim (`&`, `≥1`, `=1`, `2k+1`/`2k`). Input stubs are now drawn live-value-coloured from the fixed pin columns (`IN_X = 8`) into each body. `src/core/circuit/**` and `layout.ts` port math are untouched; `data-pin` testids, pin coordinates, and the `GateGlyph`/`PinSymbol`/`PIN_GAP` exports are preserved. Also fixed two pre-existing `TS6133` unused-code build errors in the number-systems visualizers (`showResult`, unused `ResponsiveDigitCell` import) and tightened a pre-existing loose ARIA-label matcher in `BinaryToDecimalVisualizer.test.tsx` (`/^(play|pause) animation$/i`) that matched both Play and Restart buttons.
- **Reasoning**: The logisim.app UI-fidelity roadmap (`CIRCUIT-PARITY.md`, new phase). logisim.app renders classic Logisim's Java drawing code, so `PainterShaped`/`OddParityGate`/`ControlledBuffer` geometry is the ground truth; matching it makes the simulator's symbols look like the reference app.
- **Impact**: Pure presentation. Full suite green: 1434/1434 tests pass (93 files); lint 0 errors; `tsc -b && vite build` green (pre-existing chunk-size warning only).
- **Files Modified**:
  - `src/simulators/circuit/GateGlyph.tsx` — Logisim-shaped `shaped()` geometry, live-value stubs, enable line, Logisim inside-symbols; removed `bodyPath`/`bodyRightTip`
  - `src/tests/simulators/numbersystems/BinaryToDecimalVisualizer.test.tsx` — precise play/pause ARIA matcher (pre-existing duplicate-match fix)
  - `src/simulators/numbersystems/ConversionGridTable.tsx` — removed unused `showResult` (pre-existing build error)
  - `src/simulators/numbersystems/PowerOfTwoRow.tsx` — removed unused `ResponsiveDigitCell` import (pre-existing build error)
  - `CIRCUIT-PARITY.md` — new UI Fidelity phase (Unit A documented)

### [Added]
- **Component**: Circuit designer Phase 11 — example circuit templates
- **Description**: The designer ships with three loadable example templates — **Adder**, **MUX+DEMUX** and **ALU** — served through the existing save/load machinery: each is a plain, versioned `ProjectFile` that `parseProjectJSON` accepts and `loadProject` opens, exactly like a downloaded/imported project. New pure-TS `src/application/circuit/examples.ts` defines `EXAMPLE_CIRCUITS` (`{ id, name, description, project }`) plus `getExample(id)`, wiring the mixed compound-block schematics (Adder = A/B/Cin → `adder` → Sum/Cout; MUX+DEMUX = 2:1 `mux` through a 1:2 `demux` on a shared select; ALU = `adder` / `subtractor` / `AND` / `OR` into a 4:1 result `mux`). The designer gains a top-level **Examples** menu (`menu-examples`) with one item per template (`example-{id}`), each loading via the existing `loadProject` (replacing the whole project and clearing history, matching File ▸ Import) and showing a transient notice.
- **Reasoning**: Phase 11 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`). Example circuits make the compound library components discoverable and give users a correct, inspectable starting point — reusing the same JSON round-trip/validation path as downloaded projects rather than a new load mechanism.
- **Impact**: Pure application + presentation — `src/core/circuit/**` engine untouched. App-layer round-trip/behaviour tests (9) plus two designer UI tests confirm each template loads correctly; 1104+ tests passing with only the 3 known pre-existing `App.test.tsx` stale checks failing. Lint 0 errors; production build green.
- **Files Modified**:
  - Added `src/application/circuit/examples.ts`, `src/tests/application/circuit/examples.test.ts`
  - `src/application/circuit/index.ts` - re-export `* from './examples'`
  - `src/simulators/circuit/CircuitDesigner.tsx` - Examples menu + `handleLoadExample`
  - `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - Examples-menu UI tests
  - `CIRCUIT-PARITY.md` - Phase 11 entry

### [Updated]
- **Component**: Circuit designer Phase 10 — toolbar + hierarchical Explorer
- **Description**: The flat palette is now Logisim-style. A top icon toolbar (Poke / Select / Wire / Label + gate and library `GlyphButton`s with live mini-glyphs) sits between the menu bar and the workspace; the left sidebar's flat Tools / Gates / Wiring-IO-Arith-Plexers-Memory sections are replaced by a hierarchical Explorer tree grouped into standard Logisim library folders — Wiring, Gates, Plexers, Arithmetic, Memory, IO — each a collapsible `<details>` group. New helpers: `GlyphButton` (mini gate/library preview), `ToolIconButton` + `ToolGlyph` (tool icons), `selectExplorerItem`, and the `EXPLORER_BY_LIBRARY` / `EXPLORER_ORDER` / `isGateTypeName` grouping. Explorer rows use `explorer-{type}` and `library-{lib}` testids while the toolbar keeps every `palette-{type}` / `tool-{tool}` testid, so placement/drag/wire gestures and the existing tests are unchanged. The now-unused `ToolButton` component was removed.
- **Reasoning**: Phase 10 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`). Matches logisim.app's real UI: icon toolbar up top and a hierarchical library tree in the left Explorer.
- **Impact**: Pure presentation — `src/core/circuit/**` engine untouched. All 28 designer tests pass (palette/tool testids preserved); lint 0 errors; production build green.
- **Files Modified**:
  - `src/simulators/circuit/CircuitDesigner.tsx` - toolbar row, `GlyphButton`, `ToolIconButton`/`ToolGlyph`, Explorer tree, `selectExplorerItem`, grouping data; removed `ToolButton`
  - `CIRCUIT-PARITY.md` - Phase 10 entry

### [Updated]
- **Component**: Circuit designer Phase 9 — authentic gate symbols (no box)
- **Description**: Gates now render as classic Logisim silhouettes — D-shape AND/NAND, curved OR/NOR/XOR/XNOR, triangle BUFFER/NOT/controlled, trapezoid parity — drawn edge-to-edge across the symbol area with **no surrounding rounded box**. Pin anchors land exactly on the symbol edges. `layout.centerRow` is exported as the single source of truth for pin rows so glyph pins and the wire-routing port math (`portAbsPos`) stay in lockstep. `GateGlyph` gained `label`/`labelLocation` props (the label previously lived on the box), and `CircuitDesigner` draws the box + centred label only for non-gate components while preserving each gate's selection outline, label location and rotation.
- **Reasoning**: Phase 9 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`). This is the presentation change that makes the designer actually look like Logisim (symbol-driven, not box-driven), matching the visual fidelity goal.
- **Impact**: Pure presentation — `src/core/circuit/**` engine untouched. All 260 circuit/gate/layout tests pass; lint 0 errors; production build green.
- **Files Modified**:
  - `src/simulators/circuit/layout.ts` - exported `centerRow`
  - `src/simulators/circuit/GateGlyph.tsx` - full-size edge-to-edge bodies + `bodyRightTip` + `label`/`labelLocation` props, pins on `centerRow`
  - `src/simulators/circuit/CircuitDesigner.tsx` - box only for non-gates; pass label props to `GateGlyph`
  - `CIRCUIT-PARITY.md` - Phase 9 entry

### [Added]
- **Component**: Circuit designer Phase 8 — fidelity polish + `.circ` export
- **Description**: Visual-communication polish across the designer plus a Logisim portability export. Gates gain a `Label Location` (top/bottom) attribute and the parity gate body is drawn as the Logisim-style trapezoid; multi-bit input/output pins show a "N-bit" bus tag; the probe renders a **per-bit** MSB-first lane row instead of one packed number for widths > 1; active-high wires carry an animated **propagation-flow** overlay; the header gains an **app appearance toggle** (light/dark via the existing `ThemeContext`). Application layer gains `src/application/circuit/logisim.ts` — a real Logisim 2.x-style `.circ` XML exporter (`toLogisimXml`/`downloadLogisimCirc`) mapping every component to its Logisim library tool name with lossless `_type`/`_attrs` annotations, exposed as File ▸ Export .circ…
- **Reasoning**: Phase 8 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`), final phase. Shaped gate symbols, label/pin placement, propagation visuals, per-bit probes and the appearance toggle are Logisim-fidelity marks; `.circ` export is the chosen "stretch" (import is a documented future item).
- **Impact**: 1109 tests passing; only the 3 known pre-existing `App.test.tsx` stale checks fail. `CircuitDesigner` now requires the app `ThemeProvider` (hardened for non-DOM/jsdom `matchMedia`). Fully tested.
- **Files Modified**:
  - Added `src/application/circuit/logisim.ts`, `src/tests/application/circuit/logisim.test.ts`
  - `src/core/circuit/descriptors.ts` - `labelLocation` (top/bottom) on gates
  - `src/simulators/circuit/{GateGlyph,ComponentGlyph,CircuitDesigner}.tsx` - parity trapezoid + pin width tags, per-bit probe, wire-flow overlay, theme toggle, Export .circ menu
  - `src/contexts/ThemeContext.tsx` - safe `matchMedia` guard for tests/SSR
  - `src/index.css` - `wire-flow` animations
  - `src/tests/core/circuit/descriptors.test.ts`, `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - defaults + ThemeProvider-wrapped UI tests

### [Added]
- **Component**: Circuit designer Phase 7 — Memory library
- **Description**: The Memory library: three edge-triggered flip-flops (JK, T, SR), a multi-bit Register, an up/down Counter, and stored RAM / ROM. Core gained a new `src/core/circuit/memory.ts` (`evalMemoryRead` combinational read + `memTick` edge-triggered advance + `isMemoryType`/`memLen`/`initialRam`), and `SimState` grows `mem: Map<id, MemState>` (value + last clock level) and `ram: Map<id, RamState>` (word array) so `simulate.ts` propagates stored state and `tick` advances it on rising edges. All seven are `Memory`-category descriptors with `isStateful:true`; `LibraryGlyph` gains a `mem-*` box icon set and the palette's Section becomes "Wiring / IO / Arith / Plexers / Memory".
- **Reasoning**: Phase 7 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`). Logisim parity demands the flip-flop family, registers, counters and read/write memory.
- **Impact**: 1104 tests passing with the full four-layer stack; only the 3 known pre-existing `App.test.tsx` stale checks fail. Unknown/error/floating inputs make a memory element hold rather than collapse to a spurious 0. `simState` remains transient (reset on project load), consistent with Phase 4. Fully tested.
- **Files Modified**:
  - Added `src/core/circuit/memory.ts`, `src/tests/core/circuit/phase7.test.ts`
  - `src/core/circuit/{state,simulate,descriptors,index}.ts` - MemState/RamState, propagate/tick dispatch, 7 memory schemas, exports
  - `src/simulators/circuit/{ComponentGlyph,CircuitDesigner}.tsx` - `mem-*` glyphs + palette items (Memory section)
  - `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - RAM palette-place + clock-driven counter tests

### [Added]
- **Component**: Circuit designer Phase 6 — Plexers library
- **Description**: Six new combinational components — Multiplexer (dataCount×1, select clamped to last data bus when out of range), Demultiplexer (1→dataCount, zeros elsewhere), Decoder (one-hot 2^selBits output), Encoder (lowest set line wins, out-width selectBits(dataCount)), Priority Encoder (highest set line + group-valid bit) and Bit Selector (extracts a `groupWidth` slice of a bus, LSB-first). Core gained `src/core/circuit/plexers.ts` (`muxOutputs`/`demuxOutputs`/`decoderOutputs`/`encoderOutputs`/`priorityEncoderOutputs`/`bitSelectorOutputs`/`selectBits`/`evalPlexerComponent`) with float/error propagation on data and select lines; `evalSourceComponent` dispatches all six types; schemas (DATA_W ≤ 16, DATA_COUNT 2..32, LINE_COUNT, SEL_BITS 1..5) and `plexer-*` palette glyphs were added.
- **Reasoning**: Phase 6 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`).
- **Impact**: The palette gains a "Plexers" family; all six components simulate end-to-end through the four-layer stack and are fully unit- and wiring-tested. Only failing tests remain the three known pre-existing `App.test.tsx` checks. Fully tested.
- **Files Modified**:
  - Added `src/core/circuit/plexers.ts`, `src/tests/core/circuit/plexers.test.ts`
  - `src/core/circuit/{arith,descriptors,index}.ts` - plexer dispatch + schemas + exports
  - `src/simulators/circuit/{ComponentGlyph,CircuitDesigner}.tsx` - `plexer-*` glyphs + palette items (Plexers section)
  - `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - palette-place coverage for mux

### [Added]
- **Component**: Circuit designer Phase 5 — gates + wiring completeness
- **Description**: Completes the Logisim-style library with controlled gates (Controlled Buffer, Controlled Inverter), Odd/Even Parity gates, Logisim's default 5-input gate arity (up to 32), and two wiring components — Splitter (bidirectional multi-bit bus fan-out / fan-in with undriven arms → Unknown lanes) and Pull Resistor (forces an undriven line to a configured 0/1). Core gained `src/core/circuit/wirelib.ts` (`splitterArmWidths`/`splitterNets`/`pullNet`), tri-state controlled-gate semantics in `value.ts` (`evaluateControlledVector` — a fully-zeroed control bus genuinely floats), four new `GateDefinition`s across `src/core/gates/**`, a gate arity schema (`ARITY_GATES`, `INPUTS_ATTR` default 5 / max 32) plus `splitter`/`pull` descriptors, and `evalSourceComponent` dispatches for both wiring types.
- **Reasoning**: Phase 5 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`). Logisim parity demands controlled gates (tri-state), parity gates, and bus-splitting/pull-up wiring.
- **Impact**: The gate palette grows from 8 to 12 gates; `makeGate` accepts pass-through attributes. New gates, splitter and pull simulate end-to-end through the four-layer stack. Education catalogs (concepts/exercises/why) and the gate challenge prioritise the new gates. **Design note**: in the truth-table/bit model a disabled controlled gate outputs 0, while the circuit simulator emits a true floating (high-impedance) bus — a documented divergence of the two evaluation paths. Only failing tests remain the two known pre-existing `App.test.tsx` checks. Fully tested.
- **Files Modified**:
  - Added `src/core/circuit/wirelib.ts`, `src/tests/core/circuit/{wirelib,phase5}.test.ts`
  - `src/core/gates/{types,catalog,evaluate}.ts` - CON_BUF/CON_INV/ODD_PARITY/EVEN_PARITY + arity 2..32
  - `src/core/circuit/{value,arith,descriptors,index}.ts` - tri-state control, splitter/pull dispatch + schemas, exports
  - `src/education/gates/{concepts,exercises,why}.ts` - extended catalogs & explanations
  - `src/simulators/gates/GateSymbol.tsx`, `src/simulators/circuit/{layout,GateGlyph.tsx,ComponentGlyph.tsx,CircuitDesigner.tsx,index.ts}` - new glyphs + splitter/pull palette items
  - `src/tests/core/gates/{catalog,evaluate}.test.ts`, `src/tests/core/circuit/{evaluate,descriptors}.test.ts`, `src/tests/stores/circuitStore.history.test.ts`, `src/tests/education/gates/challenge.test.ts`, `src/tests/simulators/gates/GateChallenge.test.tsx`, `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - updated for 12-gate set & default-5 arity plus Phase 5 coverage

### [Added]
- **Component**: Circuit designer Phase 4 — priority libraries (Wiring / IO / Arithmetic)
- **Description**: New component libraries with free-running clocks/ticks, probes, constants, tunnels, LEDs, buttons, 7-segment displays, and the four headline arithmetic components (Adder, Subtractor, Comparator, Negator), plus multi-bit pins/buttons so buses flow everywhere. Core gained `src/core/circuit/arith.ts` (width-aware `addBuses`/`subBuses`/`negateNet`/`compareBuses`/`evalSourceComponent`), `SimState.clock` with `clockOutput`/`clockTick` in `state.ts`, schemas for all 11 components in `descriptors.ts`, and a two-phase `tick` in `simulate.ts` (advance clocks, then re-propagate so DFFs sample the new clock edge). The store gained persistent `simState` + `tickSim()` and new `add-*` tools; the presentation gained `LibraryGlyph` (icon set + port pegs), a Wiring / IO / Arithmetic palette section with live previews, and **Simulate ▸ Tick Clock**.
- **Reasoning**: Phase 4 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`).
- **Impact**: New component types simulate end-to-end through the four-layer stack. Persistent `simState` is transient (reset on project load). Only failing test remains the known pre-existing `App.test.tsx` DigiWorld heading check. Fully tested.
- **Files Modified**:
  - Added `src/core/circuit/arith.ts`, `src/simulators/circuit/ComponentGlyph.tsx`, `src/tests/core/circuit/arith.test.ts`, `src/tests/core/circuit/phase4.test.ts`, `src/tests/stores/circuitStore.phase4.test.ts`
  - `src/core/circuit/{state,descriptors,simulate,index}.ts` - clock state/schema/engine + dispatch + exports
  - `src/stores/circuitStore.ts` - `simState`, `tickSim`, new `add-*` `Tool` kinds
  - `src/simulators/circuit/CircuitDesigner.tsx` - library palette section, LibraryGlyph wiring, Simulate ▸ Tick Clock
  - `src/simulators/circuit/index.ts` - export `LibraryGlyph`
  - `src/tests/core/circuit/state.test.ts` - clock tests; `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - palette-place / tick / wired-adder tests

### [Added]
- **Component**: Circuit designer Phase 3 — persistence + undo/redo
- **Description**: Circuits now survive reload. A new application layer (`src/application/circuit/`) orchestrates JSON persistence (`persistence.ts`) and the undo/redo snapshot history (`history.ts`) with no React. File ▸ Download/Import Project… talks to `.json` files; a debounced autosave writes the editable project to `localStorage` (`csd-sim.project.v1`) and hydrates it on the designer's first mount. Edit ▸ Undo/Redo (+Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z) walk a capped snapshot stack covering components, wires, tabs, active tab and forced input-pin values; loaded projects reseed the id allocator so restored ids can't collide and start with a fresh history.
- **Reasoning**: Phase 3 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`).
- **Impact**: Store gained `past`/`future` history buckets, an internal `withHistory` wrapping every undoable mutation, and `undo`/`redo`/`loadProject` actions. All existing behaviour preserved; the only failing test remains the known pre-existing `App.test.tsx` DigiWorld heading check. Fully tested.
- **Files Modified**:
  - Added `src/application/circuit/{history,persistence,index}.ts` and `src/tests/application/circuit/{history,persistence}.test.ts`
  - `src/stores/circuitStore.ts` - `past`/`future` state, `withHistory`, `undo`/`redo`/`loadProject`, `idCounterAtLeast`, undoable actions wrapped
  - `src/simulators/circuit/CircuitDesigner.tsx` - Edit Undo/Redo, File Download/Import, Ctrl+Z/Y/Shift+Z, hydration + autosave, import file input + status notice
  - `src/tests/stores/circuitStore.history.test.ts` - undo/redo/load integration
  - `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - menu/keyboard/import coverage + history reset in `beforeEach`

### [Added]
- **Component**: Circuit designer Phase 2 — Logisim-style UI parity
- **Description**: Multi-circuit tabs, a menu bar (File/Edit/Simulate), an Explorer tree, a descriptor-driven attribute table, and canvas junction dots. The store now holds `tabs: CircuitTab[]` + `activeTabId` (create/switch/remove circuits; subcircuits are live tabs), adds a `setAttr` action, and resolves subcircuit instances from the tabs. The attribute panel renders the selected component's schema (label, bit width, gate input count, …) as editable text/number/select/boolean controls.
- **Reasoning**: Phase 2 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`) — Logisim's editing experience is its project tree, menus, attributes, and multi-circuit workspace.
- **Impact**: Store shape changed from single `circuit` to `tabs`; UI features previously disabled (attribute editing, multiple circuits) are now live. Fully tested.
- **Files Modified**:
  - `src/stores/circuitStore.ts` - multi-tab model, `createCircuit`/`switchTab`/`removeTab`, `setAttr`, `libraryAdapter` from tabs
  - `src/simulators/circuit/CircuitDesigner.tsx` - menu bar, Explorer tree, tabs bar, attribute table, junction dots
  - `src/simulators/circuit/layout.ts` - `junctionPoints` helper
  - `src/simulators/circuit/index.ts` - export `junctionPoints`
  - `src/tests/simulators/circuit/CircuitDesigner.test.tsx`, `layout.test.ts` - tabs/attribute/menu/junction coverage

### [Added]
- **Component**: Circuit engine Phase 1 — declarative component model + attribute system
- **Description**: Replaced the hard-coded `ComponentKind` union and every `.kind` branch in the engine/UI with a declarative component descriptor registry. Components are now `{ id, type, attrs, x, y, rotation }`; `src/core/circuit/descriptors.ts` provides per-kind schemas (`AttributeSchemaEntry[]`), defaults (`defaultAttrs`/`normalizeAttrs`), port-count resolution (`portCountOf`), gate math and statefulness — new libraries become data entries, not branches. The store's `addComponent(type, attrs)`/`renameComponent`, layout port counts/labels, gate glyphs and the `GATE_TYPES` palette all read through the registry.
- **Reasoning**: Phase 1 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`) — the attribute table (Phase 2) and new component libraries (Phase 4+) need a data-driven component model.
- **Impact**: Same set of component types simulate identically. `Circuits` serialized differently (`type` + `attrs`), so this is the authoritative model the Phase-3 persistence will use. Fully tested.
- **Files Modified**:
  - Added `src/core/circuit/descriptors.ts`, `src/tests/core/circuit/descriptors.test.ts`
  - `src/core/circuit/types.ts` - `Component` is now `{ type, attrs }`; `ComponentKind` removed; `portSignatureFor` via descriptors
  - `src/core/circuit/build.ts` - `addComponent(id, type, attrs?)`, `makeGate`
  - `src/core/circuit/simulate.ts` - type/attrs resolution through descriptors
  - `src/core/circuit/index.ts` - descriptor exports
  - `src/stores/circuitStore.ts` - `addComponent(type, attrs)`, `renameComponent`, `libraryAdapter`
  - `src/simulators/circuit/{layout,CircuitDesigner,GateGlyph}` - descriptor-driven port counts, labels, glyphs, palette
  - Migrated `evaluate.test.ts`, `state.test.ts`, `CircuitDesigner.test.tsx` to the `{ type, attrs }` model

### [Added]
- **Component**: Circuit engine Phase 0 — multi-bit + stateful simulation
- **Description**: Graduated the Logisim-style circuit engine from 1-bit to width-aware buses and added sequential state. New `src/core/circuit/value.ts` defines `BitVector`/`NetValue` (per-lane `0/1/X/E`) with helpers (`bitValue`, `packedValue`, `eq`, `evaluateGateVector`, …); pins carry a `width`; wires propagate source width and mismatches produce an error net (`'E'`). New `src/core/circuit/state.ts` provides `SimState` and a minimal D flip-flop (`dff` kind) proving the tick API (`propagate` + `tick`); `evaluateCircuit` remains as a backwards-compatible 1-bit facade. Combinational-cycle detection now ignores feedback paths that pass through stateful components, so sequential feedback (e.g. Q→D) is legal while a NOT loop is still flagged as oscillation.
- **Reasoning**: Phase 0 of the logisim.app-parity roadmap (`CIRCUIT-PARITY.md`) — arithmetic, probes, 7-segment, and memory all need multi-bit signals and clocked state.
- **Impact**: Existing 1-bit circuits simulate identically; UI/store untouched (still uses `evaluateCircuit`). New engine units fully tested.
- **Files Modified**:
  - Added `src/core/circuit/value.ts`, `src/core/circuit/state.ts`, `src/tests/core/circuit/value.test.ts`, `src/tests/core/circuit/state.test.ts`
  - `src/core/circuit/types.ts` - `width` on pins, `dff` kind, `isStatefulKind`
  - `src/core/circuit/simulate.ts` - `propagate`/`tick`, width-aware evaluation, oscillation fix, `setIfChanged` by value
  - `src/core/circuit/index.ts` - new exports
  - `src/simulators/circuit/{layout,CircuitDesigner}.ts`, `GateGlyph.tsx` - read nets via `bitValue`
  - `src/tests/core/circuit/evaluate.test.ts`, `src/tests/simulators/circuit/CircuitDesigner.test.tsx` - migrated assertions
  - `src/core/numbersystems/**` + tests - fixed pre-existing type errors that blocked `tsc -b`
  - Added `CIRCUIT-PARITY.md`

### [Added]
- **Component**: CI Pipeline
- **Description**: Added a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on push to `main` and PRs. It installs with `npm ci`, runs a security audit, lint, production build, unit tests, and Playwright E2E (Chromium), with failed-run artifact upload.
- **Reasoning**: The project had no continuous integration gate; a pipeline closes the "no CI/CD" production gap identified in the readiness review.
- **Impact**: Repo-level verification on every change. No app behavior change.
- **Files Modified**:
  - Added `.github/workflows/ci.yml`

### [Added]
- **Component**: Error Boundary & Error Reporting
- **Description**: Wrapped the app in a global `ErrorBoundary` (class component) that renders a recoverable fallback instead of blanking the page, and added `reportError` (logs locally; POSTs to `VITE_ERROR_ENDPOINT` when configured). `main.tsx` now forwards `window.onerror` and `unhandledrejection` through the reporter.
- **Reasoning**: Runtime crashes previously produced a blank UI with no recovery or telemetry; the production review flagged missing error resilience.
- **Impact**: Uncaught render/lifecycle/global errors are contained and logged. No behavior change on happy path.
- **Files Modified**:
  - Added `src/ErrorBoundary.tsx`
  - Added `src/errorReporter.ts`
  - `src/main.tsx` - wrapped `<App />` and added global error listeners

### [Fixed]
- **Component**: VerifyPanel dependency array
- **Description**: Replaced the complex `asKey(sopTerms, posTerms, showSOP)` memo dependency with the explicit `[kmap, showSOP, sopTerms, posTerms]` and removed the now-unused `asKey` helper.
- **Reasoning**: The `react-hooks/exhaustive-deps` warning (a latent stale-closure risk) is resolved and lint is cleaner.
- **Impact**: Verily/simplified-expression recompute when term inputs change; no behavior change.
- **Files Modified**:
  - `src/simulators/kmap/components/VerifyPanel.tsx`

### [Added]
- **Component**: Playwright E2E tests
- **Description**: Added Playwright (Chromium) with `playwright.config.ts`, a `tsconfig.e2e.json` (kept out of the production build), `npm run test:e2e`, and three specs covering app load, the fixed Majority example verifying equivalent, and the guided-practice flow (form a group, get a hint). Grid cells gained stable `data-testid` selectors.
- **Reasoning**: The production review flagged the absence of browser-level tests; E2E verifies the real user journeys that unit tests cannot.
- **Impact**: Purely additive test infra. Test-selector attributes added to `KMapGrid`; no visual change.
- **Files Modified**:
  - Added `playwright.config.ts`, `tsconfig.e2e.json`, `e2e/practice.spec.ts`
  - `package.json` - `test:e2e` script and `@playwright/test` dev dependency
  - `src/simulators/kmap/components/KMapGrid.tsx` - `data-testid` on cells
  - `.gitignore` - `test-results`, `playwright-report`, `blob-report`

### [Fixed]
- **Component**: Vitest / Vite version alignment
- **Description**: Re-pinned `vitest` from `^3.2.4` to `^4.1.10` (the version the committed lockfile actually resolved) and excluded `**/e2e/**` from Vitest's test discovery.
- **Reasoning**: `npm install` had resolved vitest 3.x, which nests Vite 7 alongside the project's Vite 8, breaking type-checking of `vite.config.ts`; vitest 4.1.10 is aligned with Vite 8. Vitest was also picking up Playwright specs and failing.
- **Impact**: Restores a single, consistent Vite 8.2.1 tree; unit and E2E suites no longer collide.
- **Files Modified**:
  - `package.json`, `package-lock.json` - vitest pin
  - `vite.config.ts` - `**/e2e/**` in test exclude

### [Refactored]
- **Component**: SOPPOSConcept StepBody
- **Description**: Split the `StepBody` switch into parameterized step components under `components/SOPPOSConcept/steps/` (`GoalStep`, `TransformationStep`, `TermDefinitionStep`, `ToCellStep`, `GroupStep`, `ReasonChain`). The SOP and POS branches were mirror-duplicate JSX; they are now driven by `mode`/`spec`/`input` props.
- **Reasoning**: Removes the duplicated SOP/POS step markup while keeping the lesson's rendered output and behavior identical. Unique steps (intro, comparison, bridge) remain inline.
- **Impact**: No behavior or visual change. `LESSON_STEPS`/logic tests unaffected.
- **Files Modified**:
  - Added `src/simulators/kmap/components/SOPPOSConcept/steps/{GoalStep,TransformationStep,TermDefinitionStep,ToCellStep,GroupStep,ReasonChain}.tsx`
  - `src/simulators/kmap/components/SOPPOSConcept/SOPPOSConcept.tsx` - `StepBody` now routes to extracted steps

### [Updated]
- **Component**: Architecture Documentation
- **Description**: Corrected the repository layout and architecture description to reflect the actual 4-layer model (Presentation → Application → Educational Engine → Logic Engine). README listed a stale 3-layer scaffold layout (`components/`, `pages/`, `utils/`) and omitted `application/`; the app home page claimed "three-layer".
- **Reasoning**: Docs no longer matched the real `src/` structure, causing confusion about the architecture.
- **Impact**: No code behavior change.
- **Files Modified**:
  - `README.md` - Repository Layout + Architecture section
  - `src/App.tsx` - Home page now shows four Layer cards and "four-layer architecture"

### [Removed]
- **Component**: Dead educational scaffold (`application/learning`, `education/hints`)
- **Description**: Moved the unused `LearningStep` model (`src/application/learning/`) and the placeholder `education/hints` module to `trash/`, and removed `export * from './learning'` from `src/application/index.ts`.
- **Reasoning**: Both were dead code with no production consumers; real hint/step logic lives in `education/practice` and `application/kmap/walkthrough.ts`. See `trash/trash.md`.
- **Impact**: No behavior change; verified no live imports remain (lint + build + full test suite pass).
- **Files Modified**:
  - `src/application/index.ts` - dropped learning re-export
  - Moved to `trash/src/application/learning/` and `trash/src/education/hints/`

### [Updated]
- **Component**: KMapSimulator Header Layout
- **Description**: Rebuilt the simulator header as a single responsive row with Home (left), centered title/subtitle, and Practice & Mastery (right)
- **Reasoning**: Consolidate navigation into one clean row and add direct practice access from the simulator
- **Impact**: Home and Practice buttons use icons with labels hidden on small screens (hover tooltips), improving navigation and mobile layout
- **Files Modified**:
  - `src/simulators/kmap/KMapSimulator.tsx` - Added `onBackToHome`/`onOpenPractice` props and single-row header

### [Updated]
- **Component**: KMapSimulator Section Reordering
- **Description**: Reordered the right-column result panel to: Simplified Expression → Solution Walkthrough → Verify → Learning Guide → Why SOP/POS → Example Library → remaining sections, and moved the Advanced analysis panel to full width below both columns
- **Reasoning**: Users requested a logical learning flow and a full-width advanced panel
- **Impact**: "Why SOP Uses 1s and POS Uses 0s?" is now its own standalone collapsible section instead of being nested inside the Learning Guide; Connect Representations panel now spans the full row
- **Files Modified**:
  - `src/simulators/kmap/KMapSimulator.tsx` - Reordered sections, extracted SOPPOSConcept, moved AdvancedPanel full-width

### [Added]
- **Component**: KMapSimulator View Mode Toggle
- **Description**: Added a K-Map / Both / Truth-Table view toggle to the grid card, with a gap between the grid and the truth table
- **Reasoning**: Let users focus on the grid, the truth table, or both simultaneously
- **Impact**: Truth table now renders inside the grid card and reacts to the selected/hovered cell; default view shows both
- **Files Modified**:
  - `src/simulators/kmap/KMapSimulator.tsx` - Added `viewMode` state and toggle, wired TruthTablePanel inline

### [Updated]
- **Component**: KMapSimulator Solution Walkthrough
- **Description**: Converted the Solution Walkthrough into its own collapsible section and made solution generation lazy
- **Reasoning**: Avoid recomputing the walkthrough when the panel is closed; keep the UI tidy
- **Impact**: Walkthrough and Grouping Solution render only when expanded; computation is skipped when collapsed
- **Files Modified**:
  - `src/simulators/kmap/KMapSimulator.tsx` - Added `walkthroughOpen`, lazy `walkthroughSolution`

### [Updated]
- **Component**: KMapSimulator Cell Information Interaction
- **Description**: Cell info now updates live on hover while remaining pinned on right-click
- **Reasoning**: Users expected hovering another cell to immediately reflect its information in the expanded section until manually closed
- **Impact**: Right-click pins the info panel; hovering a different cell swaps its content live; the panel stays open until the user closes it
- **Files Modified**:
  - `src/simulators/kmap/KMapSimulator.tsx` - Hover takes priority (`hoveredCell ?? cellInfoPinned`) for both the info popup and truth-table highlight

### [Updated]
- **Component**: KMapSimulator UI Restoration
- **Description**: Restored the rich educational UI features that were lost during the architecture hardening
- **Reasoning**: The previous working UI had comprehensive educational content that was accidentally removed during the architectural refactoring. Users reported the previous UI was much better for learning.
- **Impact**: Enhanced user experience with restored educational features while preserving the architectural improvements from the 4-layer architecture
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Restored Learning Guide section with 6 expandable educational topics, enhanced Cell Info Popup with detailed information, added show/hide toggle for educational content, removed non-functional mode selector

### [Updated]
- **Component**: KMapSimulator Educational Content
- **Description**: Restored comprehensive Learning Guide with 6 expandable sections covering Minterms/Maxterms, Binary to Product Terms, SOP/POS structures, Variable Complementation Rules, and K-Map Fundamentals
- **Reasoning**: These educational sections were essential for student learning and were lost during architectural refactoring
- **Impact**: Students now have access to progressive learning content with explanations of fundamental concepts
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Added expandable educational sections with show/hide toggle

### [Updated]
- **Component**: KMapSimulator Cell Information Popup
- **Description**: Reverted cell information popup from tooltip back to modal style per user preference
- **Reasoning**: User preferred the previous modal-style popup over the tooltip implementation
- **Impact**: Cell information now appears as a modal below the K-map grid instead of a floating tooltip
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Reverted CellInfoPopup to modal style with close button
  - `src/simulators/kmap/components/KMapGrid.tsx` - Removed mouse position tracking and tooltip positioning

### [Updated]
- **Component**: KMapSimulator POS Display
- **Description**: Fixed POS group display to properly show parentheses around sum terms
- **Reasoning**: POS groups were not displaying with proper parentheses, making them harder to read
- **Impact**: POS expressions now display correctly as (A+B)(C+D) format
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Added parentheses around POS group sumText display

### [Updated]
- **Component**: KMapSimulator Example Library
- **Description**: Moved Example Library below Learning Guide and made it collapsible
- **Reasoning**: User requested better organization with Example Library positioned after educational content
- **Impact**: Improved UI organization with collapsible Example Library section
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Moved Example Library to collapsible ExpandableSection after Learning Guide

### [Updated]
- **Component**: KMapSimulator Cell Interaction
- **Description**: Changed cell information trigger from hover to right-click
- **Reasoning**: Modal-style popup works better with explicit user action rather than hover
- **Impact**: Users can now right-click on cells to see detailed information without accidental triggers
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Added handleCellInfo function and right-click handler
  - `src/simulators/kmap/components/KMapGrid.tsx` - Added onContextMenu handler for cell info display

## [0.2.0] - 2026-08-10 00:35

### [Fixed]
- **Component**: KMapSimulator Cell Info Popup
- **Description**: Fixed cell information popup appearing only for a fraction of a second when hovering over cells
- **Reasoning**: The original implementation used a full-screen modal overlay that caused mouse events to immediately leave the cell, triggering the popup to close. Changed to a tooltip-style popup positioned near the mouse cursor.
- **Impact**: Improved user experience - cell information now remains visible while hovering
- **Files Modified**: 
  - `src/simulators/kmap/KMapSimulator.tsx` - Changed CellInfoPopup from modal to tooltip, added mouse position tracking
  - `src/simulators/kmap/components/KMapGrid.tsx` - Added onMouseMove prop and event handler

### [Refactored]
- **Component**: Project Structure - Dead File Cleanup
- **Description**: Moved unused placeholder directories, empty files, and educational concept components to trash folder
- **Reasoning**: The project contained many empty placeholder directories and unused components that added unnecessary complexity. This cleanup reduces project clutter while preserving files for potential future use.
- **Impact**: Cleaner project structure, 20+ files moved to trash, 6 tests removed (concept tests), no breaking changes to active functionality
- **Files Modified**: 
  - Created `trash/` directory structure
  - Moved empty directories: `src/education/assessments/`, `src/education/lessons/`, `src/core/combinational/`, `src/core/number-systems/`, `src/core/sequential/`, `src/components/`, `src/pages/`, `src/simulators/adders/`, `src/simulators/flipflops/`, `src/simulators/gates/`, `src/utils/`
  - Moved placeholder files: `.gitkeep` files in various directories, placeholder index files
  - Moved unused components: `src/education/concepts/` directory and corresponding tests
  - Created `trash/trash.md` with detailed documentation

### [Fixed]
- **Component**: TypeScript Compilation Errors
- **Description**: Fixed multiple TypeScript compilation errors across 5 files
- **Reasoning**: Import paths and type definitions were incorrect after the architecture hardening. The application layer exports needed to be properly structured.
- **Impact**: TypeScript compilation now succeeds, no errors, all 197 tests passing
- **Files Modified**:
  - `src/core/kmap/verification.ts` - Added missing GroupValidation import
  - `src/simulators/kmap/KMapSimulator.tsx` - Fixed prop name, removed unused imports
  - `src/stores/kmapStore.ts` - Fixed import paths and removed duplicate exports
  - `src/tests/application/kmap/use-cases.test.ts` - Fixed import source for types

### [Added]
- **Component**: Development Guidelines
- **Description**: Created agent.md file with comprehensive development guidelines
- **Reasoning**: Need clear rules for file management, change documentation, and development workflow to prevent breaking changes and maintain code quality.
- **Impact**: Established clear development standards for all future work
- **Files Modified**: 
  - Created `agent.md` with comprehensive development guidelines

## [0.1.0] - 2026-08-09 17:50

### [Added]
- **Component**: Architecture Hardening - Application Layer
- **Description**: Implemented 4-layer architecture by introducing Application/Orchestration layer
- **Reasoning**: Original architecture had orchestration logic scattered in presentation layer and Zustand store. Needed clear separation of concerns.
- **Impact**: Evolved from 3-layer to 4-layer architecture, added 203 tests (up from 124), all existing functionality preserved
- **Files Modified**:
  - Created `src/application/` structure with actions, modes, use-cases
  - Created `src/application/learning/steps.ts` for reusable learning step model
  - Refactored `src/stores/kmapStore.ts` to use application layer
  - Refactored `src/simulators/kmap/KMapSimulator.tsx` to extract orchestration logic
  - Enhanced `src/education/` structure with rules, hints, misconceptions modules
  - Added `src/core/kmap/verification.ts` for solution verification boundaries
  - Enhanced `src/simulators/kmap/examples/examples.ts` with metadata
  - Added comprehensive test suites for new architecture

### [Added]
- **Component**: K-Map Simulator
- **Description**: Initial implementation of interactive Karnaugh Map simulator
- **Reasoning**: Core educational tool for Boolean function simplification
- **Impact**: Fully functional K-map simulator with 2, 3, 4 variable support
- **Files Modified**:
  - Created complete K-map simulator implementation
  - Implemented core mathematical logic in `src/core/kmap/`
  - Created educational engine in `src/education/`
  - Built React UI components
  - Added comprehensive test coverage

## [0.0.1] - 2026-08-08

### [Added]
- **Component**: Project Initialization
- **Description**: Initial project setup with basic structure
- **Reasoning**: Foundation for Digital Logic Concept Lab
- **Impact**: Basic project structure with React, TypeScript, Vite
- **Files Modified**:
  - Initial project configuration
  - Basic directory structure
  - Development environment setup

---

## Version Format
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

## Change Types
- **[Added]**: New features
- **[Fixed]**: Bug fixes
- **[Refactored]**: Code restructuring without functional changes
- **[Removed]**: Removed features or files
- **[Updated]**: Updates to existing functionality
- **[Security]**: Security-related changes
- **[Performance]**: Performance improvements
