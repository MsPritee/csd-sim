# Changelog

All notable changes to the Digital Logic Concept Lab project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
