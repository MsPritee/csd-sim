/**
 * Persistence (Layer 2 — application). Pure TypeScript orchestration for the
 * circuit designer: JSON serialization, validation, localStorage autosave and
 * download/import. No React — the store and the UI delegate all persistence
 * here.
 */

import type { Circuit } from '../../core/circuit'
import { normalizeAttrs } from '../../core/circuit/descriptors'
import type { AttrValue } from '../../core/circuit/descriptors'
import { useCircuitStore } from '../../stores/circuitStore'
import type { CircuitState, CircuitTab } from '../../stores/circuitStore'

/** Bump this when the on-disk schema changes incompatibly. */
export const PROJECT_VERSION = 1
export const STORAGE_KEY = 'csd-sim.project.v1'

/** The serializable, versioned shape of a saved project. */
export interface ProjectFile {
  readonly app: 'csd-sim'
  readonly version: number
  readonly activeTabId: string
  readonly tabs: readonly CircuitTab[]
}

/** Result of parsing/importing a raw JSON document. */
export type ParseResult = { ok: true; project: ProjectFile } | { ok: false; reason: string }

/** Serialize the editable project state into a versioned JSON string. */
export function projectToJSON(state: Pick<CircuitState, 'tabs' | 'activeTabId'>): string {
  const file: ProjectFile = {
    app: 'csd-sim',
    version: PROJECT_VERSION,
    activeTabId: state.activeTabId,
    tabs: state.tabs.map((t) => ({
      id: t.id,
      name: t.name,
      circuit: {
        components: t.circuit.components.map((c) => ({
          id: c.id,
          type: c.type,
          attrs: { ...c.attrs },
          x: c.x,
          y: c.y,
          rotation: c.rotation,
        })),
        wires: t.circuit.wires.map((w) => ({ id: w.id, from: w.from, to: w.to })),
      },
    })),
  }
  return JSON.stringify(file, null, 2)
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function parseRot(v: unknown): 0 | 1 | 2 | 3 {
  const n = typeof v === 'number' ? v : 0
  return ((n % 4) + 4) % 4 as 0 | 1 | 2 | 3
}

function normalizeComponent(raw: unknown): { ok: boolean; reason?: string } {
  if (!isObj(raw)) return { ok: false, reason: 'component is not an object' }
  if (typeof raw.id !== 'string') return { ok: false, reason: 'component missing id' }
  if (typeof raw.type !== 'string') return { ok: false, reason: 'component missing type' }
  // Validate the type through the descriptor registry (throws on unknown).
  try {
    normalizeAttrs(raw.type, (raw.attrs as Readonly<Record<string, AttrValue>> | undefined) ?? {})
  } catch {
    return { ok: false, reason: `unknown component type "${raw.type}"` }
  }
  return { ok: true }
}

function normalizeCircuit(raw: unknown): { ok: boolean; reason?: string } {
  if (!isObj(raw)) return { ok: false, reason: 'circuit is not an object' }
  if (!Array.isArray(raw.components)) return { ok: false, reason: 'circuit missing components[]' }
  if (!Array.isArray(raw.wires)) return { ok: false, reason: 'circuit missing wires[]' }
  for (const c of raw.components) {
    const r = normalizeComponent(c)
    if (!r.ok) return r
  }
  for (const w of raw.wires) {
    if (!isObj(w) || typeof w.id !== 'string' || typeof w.from !== 'string' || typeof w.to !== 'string') {
      return { ok: false, reason: 'malformed wire' }
    }
  }
  return { ok: true }
}

/** Validate raw JSON text and rebuild a normalized, typed project. */
export function parseProjectJSON(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'not valid JSON' }
  }
  if (!isObj(parsed)) return { ok: false, reason: 'project must be a JSON object' }
  if (parsed.app !== 'csd-sim') return { ok: false, reason: 'not a CSD simulator project file' }
  if (!Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
    return { ok: false, reason: 'project must contain at least one circuit (tabs[])' }
  }
  const tabs: CircuitTab[] = []
  const ids = new Set<string>()
  for (const rawTab of parsed.tabs) {
    if (!isObj(rawTab)) return { ok: false, reason: 'tab is not an object' }
    const id = typeof rawTab.id === 'string' ? rawTab.id : ''
    const name = typeof rawTab.name === 'string' ? rawTab.name : id
    if (!id || ids.has(id)) return { ok: false, reason: 'duplicate or missing tab id' }
    ids.add(id)
    const norm = normalizeCircuit(rawTab.circuit)
    if (!norm.ok) return { ok: false, reason: `in circuit "${name}": ${norm.reason ?? ''}` }
    const rawComponents = (rawTab.circuit as { components: Array<Record<string, unknown>> }).components
    const rawWires = (rawTab.circuit as { wires: Array<{ id: string; from: string; to: string }> }).wires
    const circuit: Circuit = {
      components: rawComponents.map((c) => ({
        id: c.id as string,
        type: c.type as string,
        attrs: normalizeAttrs(c.type as string, (c.attrs as Readonly<Record<string, AttrValue>> | undefined) ?? {}),
        x: typeof c.x === 'number' ? c.x : 0,
        y: typeof c.y === 'number' ? c.y : 0,
        rotation: parseRot(c.rotation),
      })),
      wires: rawWires.map((w) => ({ id: w.id, from: w.from, to: w.to })),
    }
    tabs.push({ id, name, circuit })
  }
  const activeTabId =
    typeof parsed.activeTabId === 'string' && tabs.some((t) => t.id === parsed.activeTabId)
      ? parsed.activeTabId
      : tabs[0]!.id
  return { ok: true, project: { app: 'csd-sim', version: PROJECT_VERSION, activeTabId, tabs } }
}

/** Trigger a browser download of the current project as a JSON file. */
export function downloadProject(state: Pick<CircuitState, 'tabs' | 'activeTabId'>, baseName = 'circuit'): void {
  const json = projectToJSON(state)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Read and parse a project from a user-selected File object. */
export function readProjectFile(file: Blob): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(parseProjectJSON(String(reader.result ?? '')))
    reader.onerror = () => resolve({ ok: false, reason: 'could not read file' })
    reader.readAsText(file)
  })
}

/** The largest numeric id suffix across tabs/components/wires (used to reseed). */
function maxIdCounter(tabs: readonly CircuitTab[]): number {
  let max = 0
  const scan = (id: string): void => {
    const m = /^c(\d+)$/.exec(id)
    if (m) max = Math.max(max, Number(m[1]))
  }
  for (const t of tabs) {
    scan(t.id)
    for (const c of t.circuit.components) scan(c.id)
    for (const w of t.circuit.wires) scan(w.id)
  }
  return max
}

/** Push a validated project into the store, reseeding id allocation and clearing history. */
export function loadProject(project: ProjectFile): void {
  useCircuitStore.getState().loadProject(project, { reseedId: maxIdCounter(project.tabs) })
}

/** Whether a previous autosave exists in localStorage. */
export function hasAutosave(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/** Restore the autosaved project (if any). Returns true when a project loaded. */
export function restoreAutosave(): boolean {
  let raw: string | null = null
  try {
    if (!hasAutosave()) return false
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
  if (raw === null) return false
  const parsed = parseProjectJSON(raw)
  if (!parsed.ok) return false
  loadProject(parsed.project)
  return true
}

/** Clear the persisted autosave key. */
export function clearAutosave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* no-op */
  }
}

/** Debounce-write the project slice to localStorage on editable-project change. */
export function registerAutosave(delay = 400): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastTabs = useCircuitStore.getState().tabs
  let lastActive = useCircuitStore.getState().activeTabId

  const write = (state: Pick<CircuitState, 'tabs' | 'activeTabId'>): void => {
    try {
      localStorage.setItem(STORAGE_KEY, projectToJSON(state))
    } catch {
      /* storage may be unavailable (private mode / quota) — ignore */
    }
  }

  const unsubscribe = useCircuitStore.subscribe((state) => {
    const tabsChanged = state.tabs !== lastTabs
    const activeChanged = state.activeTabId !== lastActive
    if (!tabsChanged && !activeChanged) return
    lastTabs = state.tabs
    lastActive = state.activeTabId
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => write(state), delay)
  })

  return () => {
    if (timer !== null) clearTimeout(timer)
    unsubscribe()
  }
}