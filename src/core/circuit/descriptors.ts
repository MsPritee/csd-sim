/**
 * Declarative component descriptors (Layer 1). Pure TypeScript — no React, no
 * stores. Phase 1 of the logisim.app-parity roadmap replaces hard-coded
 * component branches with a registry: every component type declares its
 * attribute schema, defaults, port counts, statefulness and (for gates) the
 * Boolean math it implements. New libraries (probes, clocks, adders, memory…)
 * become data entries instead of engine/UI branches.
 */

import type { GateType } from '../gates/types'

/** Any value a component attribute can hold. */
export type AttrValue = string | number | boolean

/** One editable attribute in a component's schema (drives the Phase-2 attribute table). */
export interface AttributeSchemaEntry {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'number' | 'select' | 'boolean'
  readonly default: AttrValue
  readonly options?: readonly (string | number)[]
  readonly min?: number
  readonly max?: number
  readonly step?: number
}

/** Input/output port counts for a component instance. */
export interface PortCounts {
  readonly inputs: number
  readonly outputs: number
}

/** Optional library arity used to resolve subcircuit instances. */
export interface LibraryArity {
  readonly inputs: number
  readonly outputs: number
}

/**
 * Static metadata + behavior for one component type. All behavior is derived
 * from `attrs` at call time; descriptors hold no state.
 */
export interface ComponentDescriptor {
  /** Stable id, also stored on every `Component.type`. */
  readonly type: string
  /** Human-readable name (e.g. "AND Gate"). */
  readonly label: string
  /** Explorer/grouping category (e.g. "Gates"). */
  readonly category: string
  /** Editable attributes and their defaults. */
  readonly attributes: readonly AttributeSchemaEntry[]
  /** Port counts for an instance, optionally resolving subcircuit arity. */
  readonly portCount: (attrs: Readonly<Record<string, AttrValue>>, library?: LibraryArity) => PortCounts
  /** Whether the component holds internal state (sequential). */
  readonly isStateful: boolean
  /** The Boolean gate math this type implements, when applicable. */
  readonly gate?: GateType
}

function numberAttr(key: string, label: string, def: number, min?: number, max?: number, step?: number): AttributeSchemaEntry {
  return { key, label, type: 'number', default: def, min, max, step }
}

function textAttr(key: string, label: string, def = ''): AttributeSchemaEntry {
  return { key, label, type: 'text', default: def }
}

const WIDTH_ATTR = numberAttr('width', 'Bit Width', 1, 1, 32, 1)
/** Logisim gates default to 5 inputs and accept up to 32. */
const INPUTS_ATTR = numberAttr('inputs', 'Number of Inputs', 5, 2, 32, 1)

/** Bit width capped at 16 for the arithmetic library (keeps shift math simple). */
const BUS_ATTR = numberAttr('width', 'Bit Width', 8, 1, 16, 1)

/** Bit width for the Splitter (defaults to an 8-bit bus like Logisim). */
const SPLIT_W = numberAttr('width', 'Bit Width', 8, 1, 32, 1)

// ── Phase 6 — Plexers ────────────────────────────────────────────────
/** Data-bus width for plexers (capped at 16 like the arithmetic library). */
const DATA_W = numberAttr('width', 'Data Bit Width', 1, 1, 16, 1)
/** Number of select/data lines on a Plexer (2..32). */
const DATA_COUNT = numberAttr('dataCount', 'Number of Inputs', 2, 2, 32, 1)
/** Encoder/priority-encoder line count (2..32). */
const LINE_COUNT = numberAttr('dataCount', 'Number of Inputs', 4, 2, 32, 1)
/** Decoder select-bit count (1..5  ⇒  2..32 one-hot outputs). */
const SEL_BITS = numberAttr('selBits', 'Select Bits', 2, 1, 5, 1)

/** Where a component's label text is drawn (Phase 8 placement polish). */
const LABEL_LOC: AttributeSchemaEntry = { key: 'labelLocation', label: 'Label Location', type: 'select', default: 'bottom', options: ['bottom', 'top'] }

/** Port counts shared by all arity gates: 1 output; inputs from the `inputs` attr. */
function gatePortCount(attrs: Readonly<Record<string, AttrValue>>): PortCounts {
  const v = attrs['inputs']
  const inputs = typeof v === 'number' ? v : 5
  return { inputs, outputs: 1 }
}

const GATES: readonly GateType[] = [
  'BUFFER',
  'NOT',
  'AND',
  'NAND',
  'OR',
  'NOR',
  'XOR',
  'XNOR',
  'CON_BUF',
  'CON_INV',
  'ODD_PARITY',
  'EVEN_PARITY',
]

/** Gates whose input count is user-configurable (Logisim default 5). */
const ARITY_GATES = new Set<GateType>(['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR', 'ODD_PARITY', 'EVEN_PARITY'])

function gateDescriptor(gate: GateType): ComponentDescriptor {
  const unary = gate === 'BUFFER' || gate === 'NOT'
  const controlled = gate === 'CON_BUF' || gate === 'CON_INV'
  const arity = ARITY_GATES.has(gate)
  const label =
    gate === 'BUFFER'
      ? 'Buffer'
      : gate === 'NOT'
        ? 'NOT'
        : gate === 'CON_BUF'
          ? 'Controlled Buffer'
          : gate === 'CON_INV'
            ? 'Controlled Inverter'
            : gate === 'ODD_PARITY'
              ? 'Odd Parity'
              : gate === 'EVEN_PARITY'
                ? 'Even Parity'
                : `${gate} Gate`
  return {
    type: gate,
    label,
    category: 'Gates',
    attributes: arity ? [WIDTH_ATTR, { ...INPUTS_ATTR, default: 5 }, LABEL_LOC] : [WIDTH_ATTR, LABEL_LOC],
    portCount: (attrs) => {
      if (unary) return { inputs: 1, outputs: 1 }
      if (controlled) return { inputs: 2, outputs: 1 }
      return gatePortCount(attrs)
    },
    isStateful: false,
    gate,
  }
}

function pinDescriptor(type: 'input' | 'output'): ComponentDescriptor {
  return {
    type,
    label: type === 'input' ? 'Input Pin' : 'Output Pin',
    category: 'Wiring',
    attributes: [textAttr('label', 'Label', type === 'input' ? 'A' : 'Y'), WIDTH_ATTR],
    portCount: () => (type === 'input' ? { inputs: 0, outputs: 1 } : { inputs: 1, outputs: 0 }),
    isStateful: false,
  }
}

/** Canonical registry of every component type. */
export const COMPONENT_DESCRIPTORS: ReadonlyMap<string, ComponentDescriptor> = new Map([
  ...GATES.map((g) => [g, gateDescriptor(g)] as const),
  ['input', pinDescriptor('input')],
  ['output', pinDescriptor('output')],
  [
    'dff',
    {
      type: 'dff',
      label: 'D Flip-Flop',
      category: 'Sequential',
      attributes: [textAttr('label', 'Label')],
      portCount: () => ({ inputs: 2, outputs: 2 }),
      isStateful: true,
    },
  ],
  [
    'subcircuit',
    {
      type: 'subcircuit',
      label: 'Subcircuit',
      category: 'Library',
      attributes: [textAttr('libraryId', 'Library')],
      portCount: (_attrs, library) =>
        library ? { inputs: library.inputs, outputs: library.outputs } : { inputs: 2, outputs: 1 },
      isStateful: false,
    },
  ],
  [
    'text',
    {
      type: 'text',
      label: 'Text',
      category: 'Base',
      attributes: [textAttr('text', 'Text')],
      portCount: () => ({ inputs: 0, outputs: 0 }),
      isStateful: false,
    },
  ],
  // ── Phase 4 — Wiring ────────────────────────────────────────────────
  [
    'constant',
    {
      type: 'constant',
      label: 'Constant',
      category: 'Wiring',
      attributes: [BUS_ATTR, numberAttr('value', 'Value', 0, 0, 65535, 1), textAttr('label', 'Label', 'Constant')],
      portCount: () => ({ inputs: 0, outputs: 1 }),
      isStateful: false,
    },
  ],
  [
    'probe',
    {
      type: 'probe',
      label: 'Probe',
      category: 'Wiring',
      attributes: [textAttr('label', 'Label', 'Probe')],
      portCount: () => ({ inputs: 1, outputs: 0 }),
      isStateful: false,
    },
  ],
  [
    'tunnel',
    {
      type: 'tunnel',
      label: 'Tunnel',
      category: 'Wiring',
      attributes: [textAttr('label', 'Label', 'T')],
      portCount: () => ({ inputs: 1, outputs: 1 }),
      isStateful: false,
    },
  ],
  [
    'clock',
    {
      type: 'clock',
      label: 'Clock',
      category: 'Wiring',
      attributes: [textAttr('label', 'Label', 'Clock')],
      portCount: () => ({ inputs: 0, outputs: 1 }),
      isStateful: true,
    },
  ],
  // ── Phase 5 — Wiring completeness ────────────────────────────────────
  [
    'splitter',
    {
      type: 'splitter',
      label: 'Splitter',
      category: 'Wiring',
      attributes: [SPLIT_W, numberAttr('fanOut', 'Fan Out', 8, 2, 8, 1)],
      portCount: (attrs) => {
        const fanOut = attrNumber(attrs, 'fanOut', 8)
        return { inputs: fanOut + 1, outputs: fanOut + 1 }
      },
      isStateful: false,
    },
  ],
  [
    'pull',
    {
      type: 'pull',
      label: 'Pull Resistor',
      category: 'Wiring',
      attributes: [numberAttr('pull', 'Pull Value', 1, 0, 1, 1)],
      portCount: () => ({ inputs: 1, outputs: 1 }),
      isStateful: false,
    },
  ],
  // ── Phase 6 — Plexers ──────────────────────────────────────────────
  [
    'mux',
    {
      type: 'mux',
      label: 'Multiplexer',
      category: 'Plexers',
      attributes: [DATA_W, DATA_COUNT],
      portCount: (attrs) => {
        const dataCount = attrNumber(attrs, 'dataCount', 2)
        return { inputs: dataCount + 1, outputs: 1 }
      },
      isStateful: false,
    },
  ],
  [
    'demux',
    {
      type: 'demux',
      label: 'Demultiplexer',
      category: 'Plexers',
      attributes: [DATA_W, DATA_COUNT],
      portCount: (attrs) => {
        const dataCount = attrNumber(attrs, 'dataCount', 2)
        return { inputs: 2, outputs: dataCount }
      },
      isStateful: false,
    },
  ],
  [
    'decoder',
    {
      type: 'decoder',
      label: 'Decoder',
      category: 'Plexers',
      attributes: [SEL_BITS],
      portCount: (attrs) => {
        const selBits = attrNumber(attrs, 'selBits', 2)
        return { inputs: 1, outputs: 2 ** selBits }
      },
      isStateful: false,
    },
  ],
  [
    'encoder',
    {
      type: 'encoder',
      label: 'Encoder',
      category: 'Plexers',
      attributes: [LINE_COUNT],
      portCount: (attrs) => {
        const dataCount = attrNumber(attrs, 'dataCount', 4)
        return { inputs: dataCount, outputs: 1 }
      },
      isStateful: false,
    },
  ],
  [
    'priority_encoder',
    {
      type: 'priority_encoder',
      label: 'Priority Encoder',
      category: 'Plexers',
      attributes: [LINE_COUNT],
      portCount: (attrs) => {
        const dataCount = attrNumber(attrs, 'dataCount', 4)
        return { inputs: dataCount, outputs: 2 }
      },
      isStateful: false,
    },
  ],
  [
    'bit_selector',
    {
      type: 'bit_selector',
      label: 'Bit Selector',
      category: 'Plexers',
      attributes: [SPLIT_W, numberAttr('groupWidth', 'Output Bit Width', 1, 1, 32, 1)],
      portCount: () => ({ inputs: 2, outputs: 1 }),
      isStateful: false,
    },
  ],
  // ── Phase 4 — IO ────────────────────────────────────────────────────
  [
    'led',
    {
      type: 'led',
      label: 'LED',
      category: 'IO',
      attributes: [textAttr('label', 'Label', 'LED')],
      portCount: () => ({ inputs: 1, outputs: 0 }),
      isStateful: false,
    },
  ],
  [
    'button',
    {
      type: 'button',
      label: 'Button',
      category: 'IO',
      attributes: [textAttr('label', 'Label', 'B'), WIDTH_ATTR],
      portCount: () => ({ inputs: 0, outputs: 1 }),
      isStateful: false,
    },
  ],
  [
    'segment',
    {
      type: 'segment',
      label: '7-Segment Display',
      category: 'IO',
      attributes: [textAttr('label', 'Label', '7-Segment')],
      portCount: () => ({ inputs: 1, outputs: 0 }),
      isStateful: false,
    },
  ],
  // ── Phase 4 — Arithmetic ────────────────────────────────────────────
  [
    'adder',
    {
      type: 'adder',
      label: 'Adder',
      category: 'Arithmetic',
      attributes: [BUS_ATTR, textAttr('label', 'Label', 'Adder')],
      portCount: () => ({ inputs: 3, outputs: 2 }),
      isStateful: false,
    },
  ],
  [
    'subtractor',
    {
      type: 'subtractor',
      label: 'Subtractor',
      category: 'Arithmetic',
      attributes: [BUS_ATTR, textAttr('label', 'Label', 'Subtractor')],
      portCount: () => ({ inputs: 3, outputs: 2 }),
      isStateful: false,
    },
  ],
  [
    'comparator',
    {
      type: 'comparator',
      label: 'Comparator',
      category: 'Arithmetic',
      attributes: [BUS_ATTR, textAttr('label', 'Label', 'Comparator')],
      portCount: () => ({ inputs: 2, outputs: 3 }),
      isStateful: false,
    },
  ],
  [
    'negator',
    {
      type: 'negator',
      label: 'Negator',
      category: 'Arithmetic',
      attributes: [BUS_ATTR, textAttr('label', 'Label', 'Negator')],
      portCount: () => ({ inputs: 1, outputs: 1 }),
      isStateful: false,
    },
  ],
  // ── Phase 7 — Memory ────────────────────────────────────────────────
  [
    'jk',
    {
      type: 'jk',
      label: 'JK Flip-Flop',
      category: 'Memory',
      attributes: [textAttr('label', 'Label', 'JK')],
      portCount: () => ({ inputs: 3, outputs: 2 }),
      isStateful: true,
    },
  ],
  [
    't',
    {
      type: 't',
      label: 'T Flip-Flop',
      category: 'Memory',
      attributes: [textAttr('label', 'Label', 'T')],
      portCount: () => ({ inputs: 2, outputs: 2 }),
      isStateful: true,
    },
  ],
  [
    'sr',
    {
      type: 'sr',
      label: 'SR Flip-Flop',
      category: 'Memory',
      attributes: [textAttr('label', 'Label', 'SR')],
      portCount: () => ({ inputs: 3, outputs: 2 }),
      isStateful: true,
    },
  ],
  [
    'register',
    {
      type: 'register',
      label: 'Register',
      category: 'Memory',
      attributes: [BUS_ATTR, textAttr('label', 'Label', 'Register')],
      portCount: () => ({ inputs: 2, outputs: 1 }),
      isStateful: true,
    },
  ],
  [
    'counter',
    {
      type: 'counter',
      label: 'Counter',
      category: 'Memory',
      attributes: [BUS_ATTR, numberAttr('direction', 'Count Direction', 1, 0, 1, 1), textAttr('label', 'Label', 'Counter')],
      portCount: () => ({ inputs: 2, outputs: 1 }),
      isStateful: true,
    },
  ],
  [
    'ram',
    {
      type: 'ram',
      label: 'RAM',
      category: 'Memory',
      attributes: [BUS_ATTR, numberAttr('addrBits', 'Address Bits', 4, 1, 8, 1), textAttr('label', 'Label', 'RAM')],
      portCount: () => ({ inputs: 4, outputs: 1 }),
      isStateful: true,
    },
  ],
  [
    'rom',
    {
      type: 'rom',
      label: 'ROM',
      category: 'Memory',
      attributes: [BUS_ATTR, numberAttr('addrBits', 'Address Bits', 4, 1, 8, 1), textAttr('content', 'Contents', ''), textAttr('label', 'Label', 'ROM')],
      portCount: () => ({ inputs: 1, outputs: 1 }),
      isStateful: true,
    },
  ],
])

/** Look up a descriptor; throws for unknown component types. */
export function getDescriptor(type: string): ComponentDescriptor {
  const desc = COMPONENT_DESCRIPTORS.get(type)
  if (!desc) throw new RangeError(`Unknown component type: ${type}`)
  return desc
}

/** True when a component type is one of the Boolean gates. */
export function isGateComponentType(type: string): type is GateType {
  return COMPONENT_DESCRIPTORS.get(type)?.gate !== undefined
}

/** The default attribute values for a type (merged from its schema). */
export function defaultAttrs(type: string): Readonly<Record<string, AttrValue>> {
  return normalizeAttrs(type)
}

/** Fill missing attributes from the schema's defaults. */
export function normalizeAttrs(
  type: string,
  partial?: Readonly<Record<string, AttrValue>>,
): Readonly<Record<string, AttrValue>> {
  const desc = getDescriptor(type)
  const out: Record<string, AttrValue> = {}
  for (const a of desc.attributes) {
    out[a.key] = partial?.[a.key] ?? a.default
  }
  return out
}

/** Read a string attribute with a fallback. */
export function attrString(
  attrs: Readonly<Record<string, AttrValue>>,
  key: string,
  fallback = '',
): string {
  const v = attrs[key]
  return typeof v === 'string' ? v : fallback
}

/** Read a number attribute with a fallback. */
export function attrNumber(
  attrs: Readonly<Record<string, AttrValue>>,
  key: string,
  fallback: number,
): number {
  const v = attrs[key]
  return typeof v === 'number' ? v : fallback
}

/** Resolve an instance's port counts through its descriptor. */
export function portCountOf(
  type: string,
  attrs: Readonly<Record<string, AttrValue>>,
  library?: LibraryArity,
): PortCounts {
  return getDescriptor(type).portCount(attrs, library)
}

/** The Boolean gate math a type implements, or null when it is not a gate. */
export function gateForType(type: string): GateType | null {
  return COMPONENT_DESCRIPTORS.get(type)?.gate ?? null
}

/** Whether a component type holds sequential internal state. */
export function isStatefulType(type: string): boolean {
  return COMPONENT_DESCRIPTORS.get(type)?.isStateful ?? false
}