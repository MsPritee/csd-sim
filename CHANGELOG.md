# Changelog

All notable changes to the Digital Logic Concept Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
