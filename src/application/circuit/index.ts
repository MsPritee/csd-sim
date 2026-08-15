/**
 * Application layer for the circuit designer (Layer 2). Pure TypeScript
 * orchestration: persistence (save/load, autosave, import/export) and the
 * undo/redo snapshot history. The Zustand store and the React UI consume
 * these; neither implements the logic itself.
 */

export * from './history'
export * from './persistence'
export * from './logisim'
export * from './examples'