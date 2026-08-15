/**
 * Circuit-design engine (Layer 1). Schematic model + simulation for a
 * Logisim-style visual designer. Pure TypeScript — no React, no stores.
 */

export type {
  Bit,
  TriBit,
  ComponentId,
  PortId,
  Component,
  Wire,
  Circuit,
  PortSignature,
} from './types'
export {
  inputPort,
  outputPort,
  portComponentId,
  isOutputPort,
  parsePort,
  portSignatureFor,
} from './types'

export type {
  BitState,
  BitVector,
  NetValue,
  ErrorSignal,
  OneBitNet,
} from './value'
export {
  netFromBits,
  netFromNumber,
  floatNet,
  errorNet,
  widthOf,
  knownMask,
  errorMask,
  packedValue,
  bitValue,
  allBits,
  eq,
  evaluateGateVector,
  netToString,
} from './value'

export type { SimState, DffState, MemState, RamState } from './state'
export { emptyState, dffOutput, dffTick, clockOutput, clockTick } from './state'
export {
  evalMemoryRead,
  memTick,
  isMemoryType,
  memLen,
  initialRam,
} from './memory'

export type { AttrValue, AttributeSchemaEntry, PortCounts, LibraryArity, ComponentDescriptor } from './descriptors'
export {
  COMPONENT_DESCRIPTORS,
  getDescriptor,
  isGateComponentType,
  gateForType,
  isStatefulType,
  portCountOf,
  defaultAttrs,
  normalizeAttrs,
  attrString,
  attrNumber,
} from './descriptors'

export {
  evaluateCircuit,
  propagate,
  tick,
  signalLabel,
  makeCircuit,
} from './simulate'
export type {
  CircuitLibrary,
  EvaluationResult,
  TickResult,
  ErrorSignal as SimErrorSignal,
} from './simulate'
export {
  addBuses,
  subBuses,
  negateNet,
  compareBuses,
  evalSourceComponent,
} from './arith'
export { splitterNets, splitterArmWidths, pullNet } from './wirelib'
export {
  selectBits,
  muxOutputs,
  demuxOutputs,
  decoderOutputs,
  encoderOutputs,
  priorityEncoderOutputs,
  bitSelectorOutputs,
  evalPlexerComponent,
} from './plexers'
export {
  addComponent,
  makeGate,
  toCircuit,
  collectOutputPorts,
  findConflicts,
  portBelongsToComponent,
} from './build'