import type { GateType } from '../../core/gates/types'
import type { GateConcept } from './types'

/**
 * Per-gate learning concepts (LG-04). Each record follows the master plan's
 * concept schema and explains WHY the gate behaves as it does, not just its
 * symbol. Verification of claims is left to the core/education engines.
 */

const BUFFER: GateConcept = {
  id: 'BUFFER',
  title: 'Buffer',
  objective: 'Explain that a buffer passes a signal through unchanged and know why it is used.',
  prerequisites: ['A binary signal is 0 or 1.'],
  explanation: [
    'A buffer outputs exactly its input: Y = A. It performs no logic decision at all, yet it earns its place in real circuits.',
    'Its job is to restore or re-drive a signal — a wire weakened by distance or many fan-out branches can be passed through a buffer to regain strength without changing its value. It also isolates one part of a circuit from another.',
    'Because Y = A, the truth table is just two rows: input 0 → output 0, input 1 → output 1. Follow the signal and you can never be surprised.',
  ],
  visualization: [
    'A triangle symbol: one input on the left, one output on the right, no bubble.',
    'Toggle the input and the output should mirror it exactly.',
  ],
  interaction: ['Click the input to toggle 0 ↔ 1 and watch the output follow instantly.'],
  commonMistakes: [
    'Thinking a buffer inverts the signal — it does not; the triangle has no bubble.',
    'Confusing a buffer with a NOT gate.',
  ],
  hints: ['The triangle is a "pass-through": it strengthens without deciding.'],
  assessment: [
    'If a buffer has input 1, what is the output?',
    'Why would a designer insert a buffer instead of just connecting a wire?',
  ],
}

const NOT: GateConcept = {
  id: 'NOT',
  title: 'NOT (Inverter)',
  objective: 'Understand inversion (Y = A\') and read its two-row truth table.',
  prerequisites: ['A binary signal is 0 or 1.'],
  explanation: [
    "NOT flips its single input: Y = A'. Input 0 becomes output 1, and input 1 becomes output 0.",
    'It is the only gate that works on a single input, and it is the seed of every inverted gate: place a small circle (bubble) on a gate output and you are asking it to invert that result.',
  ],
  visualization: [
    'A triangle with a bubble (circle) at the output.',
    'The bubble is the whole point — swap it away and you have a buffer.',
  ],
  interaction: ['Toggle the single input and watch the output switch to the opposite value.'],
  commonMistakes: [
    'Forgetting the output bubble and treating NOT as a buffer.',
    "Writing Y = A instead of Y = A'.",
  ],
  hints: ['A 0 in, a 1 out; a 1 in, a 0 out.'],
  assessment: ["What is NOT(0)?", "The bubble on a gate output means what?"],
}

const AND: GateConcept = {
  id: 'AND',
  title: 'AND',
  objective: 'Understand that AND outputs 1 only when every input is 1.',
  prerequisites: ['What a binary signal is.', 'How to read a truth table.'],
  explanation: [
    'AND outputs 1 only when ALL inputs are 1; in every other row it outputs 0. For two inputs: 00→0, 01→0, 10→0, 11→1.',
    "Read it as a strict condition: the output is 1 if and only if every condition holds. Adding more inputs simply extends the same 'every input' rule — a single 0 anywhere forces the output to 0.",
  ],
  visualization: [
    'A D-shaped symbol with two inputs on the left and one output on the right.',
    'Compare every row of the truth table to the "all inputs 1" idea.',
  ],
  interaction: ['Toggle each input and notice that the output is 1 only for the row where everything is 1.'],
  commonMistakes: [
    'Using OR behavior for AND — thinking 1 appears whenever any input is 1.',
    'Forgetting AND with three or more inputs still requires every input to be 1.',
  ],
  hints: ['"AND" is strict: every input must be 1.', 'A single 0 anywhere forces AND to 0.'],
  assessment: ['AND(1, 0) = ?', 'How many of the four rows of a 2-input AND output 1?'],
}

const NAND: GateConcept = {
  id: 'NAND',
  title: 'NAND',
  objective: "Understand that NAND is AND followed by inversion and outputs 0 only when every input is 1.",
  prerequisites: ['AND behavior.', 'What a bubble on an output means.'],
  explanation: [
    "NAND is AND followed by an inversion: Y = (A·B)'. It outputs 0 only when every input is 1, and 1 for every other row.",
    "The bubble on the symbol is a constant reminder: first decide with AND, then flip the answer. This makes NAND a fun building block — any logic function can be built from NAND alone.",
  ],
  visualization: [
    'An AND symbol (D-shape) with a bubble at the output.',
    'Focus on the 11 row: every input looks satisfied, yet the output is 0. That is the bubble working.',
  ],
  interaction: ['Toggle inputs and watch the 11 row — the only row where NAND outputs 0.'],
  commonMistakes: [
    'Mixing up NAND and NOR — NAND is AND-then-invert, NOR is OR-then-invert.',
    'Putting NAND\'s single 0 row at 00 instead of 11.',
  ],
  hints: ['NAND = AND with a bubble.', 'It outputs 0 exactly when all inputs are 1.'],
  assessment: ['NAND(1, 1) = ?', 'How is NAND related to AND?'],
}

const OR: GateConcept = {
  id: 'OR',
  title: 'OR',
  objective: 'Understand that OR outputs 1 when at least one input is 1.',
  prerequisites: ['What a binary signal is.', 'How to read a truth table.'],
  explanation: [
    'OR outputs 1 when at least one input is 1, and 0 only when every input is 0. For two inputs: 00→0, 01→1, 10→1, 11→1.',
    "OR is the generous opposite of AND: AND needs everything, OR needs just one. Its only 'off' row is the all-zeros row.",
  ],
  visualization: [
    'A curved (shield-like) symbol with two inputs on the left and one output on the right.',
    'Read the truth table and notice the single 0 row.',
  ],
  interaction: ['Toggle inputs and find the only combination that produces 0 — all inputs off.'],
  commonMistakes: [
    'Confusing OR with AND — OR is "any", AND is "every".',
    'Thinking OR is exclusive: OR(1,1) = 1, but XOR(1,1) = 0.',
  ],
  hints: ['"OR" is generous: one 1 anywhere is enough.', 'The only 0 row is all-zeros.'],
  assessment: ['OR(0, 1) = ?', 'Which of the four rows is the only 0 row of a 2-input OR?'],
}

const NOR: GateConcept = {
  id: 'NOR',
  title: 'NOR',
  objective: "Understand that NOR is OR followed by inversion and outputs 1 only when every input is 0.",
  prerequisites: ['OR behavior.', 'What a bubble on an output means.'],
  explanation: [
    "NOR is OR followed by inversion: Y = (A+B)'. It outputs 1 only when every input is 0.",
    "This is the exact mirror of NAND: NAND turns off only at all-ones, NOR turns on only at all-zeros. Like NAND, NOR is functionally complete — every logic function can be built from NOR gates alone.",
  ],
  visualization: [
    'An OR symbol with a bubble at the output.',
    'Watch the all-zeros row: the only place NOR outputs 1.',
  ],
  interaction: ['Toggle inputs and find the sole 1 row — all inputs 0.'],
  commonMistakes: [
    'Forgetting the inversion: NOR(0,0) = 1 catches many students off guard.',
    'Swapping the NAND and NOR rules.',
  ],
  hints: ['NOR = OR with a bubble — 1 only when everything is 0.'],
  assessment: ['NOR(0, 0) = ?', 'Why does NOR output 1 only when all inputs are 0?'],
}

const XOR: GateConcept = {
  id: 'XOR',
  title: 'XOR',
  objective: "Understand that XOR is the 'difference detector' and outputs 1 when an odd number of inputs are 1.",
  prerequisites: ['AND and OR behavior.', 'How to read a truth table.'],
  explanation: [
    'XOR outputs 1 when an odd number of its inputs are 1. For two inputs, Y = A ⊕ B: 00→0, 01→1, 10→1, 11→0.',
    'With two inputs XOR is the difference detector — 1 exactly when the two inputs differ. With more inputs it generalizes to odd parity, which makes it the workhorse of adders and parity checks.',
  ],
  visualization: [
    'A distinctive symbol whose input side resembles an OR curve with an extra arc — the one input inlet directly opposite the output.',
    'The 11 row is where XOR differs from OR: it outputs 0.',
  ],
  interaction: ['Set both inputs to 1 and compare with OR to see the crucial difference.'],
  commonMistakes: [
    'Treating XOR like OR — XOR(1,1) is 0, not 1.',
    'Not realizing XOR generalizes to odd parity with three or more inputs.',
  ],
  hints: ['Two inputs: XOR = "they differ".', 'Any count: XOR = odd number of 1s.'],
  assessment: ['XOR(1, 1) = ?', 'Why is XOR called the difference detector?'],
}

const XNOR: GateConcept = {
  id: 'XNOR',
  title: 'XNOR',
  objective: "Understand that XNOR is the inverse of XOR and outputs 1 when an even number of inputs are 1.",
  prerequisites: ['XOR behavior.', 'What a bubble on an output means.'],
  explanation: [
    "XNOR is the inverse of XOR: Y = (A⊕B)' = A ⊙ B. With two inputs it outputs 1 when the inputs are equal — the equality detector. With more inputs it generalizes to even parity.",
    'The single difference between XNOR and XOR is the output bubble, yet that flips every decision. XNOR is handy anywhere two bits must be compared for equality.',
  ],
  visualization: [
    'An XOR symbol with a bubble at the output.',
    'The 00 and 11 rows both output 1 — the "equal" inputs.',
  ],
  interaction: ['Set the inputs equal and watch XNOR output 1, where XOR would output 0.'],
  commonMistakes: [
    'Confusing XNOR with XOR — they differ only by the bubble.',
    'Thinking XNOR behaves like NAND.',
  ],
  hints: ['XNOR = XOR with a bubble.', 'Two inputs: XNOR = equality.'],
  assessment: ['XNOR(1, 0) = ?', 'When two inputs are equal, what does XNOR output?'],
}

const CON_BUF: GateConcept = {
  id: 'CON_BUF',
  title: 'Controlled Buffer',
  objective: 'Understand that a controlled buffer passes its input through only while its control is high, and floats otherwise.',
  prerequisites: ['Buffer behavior.', 'What high impedance (floating) means.'],
  explanation: [
    'A controlled buffer is a tri-state switch: while the control input is 1 the data input passes straight through, exactly like a normal buffer; while the control is 0 the output floats (high impedance, shown as unknown) — the gate effectively disconnects.',
    'This makes it the basic building block of buses and multiplexers: many controlled buffers can share one wire, and exactly one at a time is allowed to drive it.',
  ],
  visualization: [
    'A buffer triangle with a second control input entering from the bottom.',
    'Flip the control to 0 and the output goes unknown instead of mirroring the data input.',
  ],
  interaction: ['Toggle the data input with control = 1 (output follows), then set control = 0 (output floats).'],
  commonMistakes: [
    'Forgetting that control = 0 disconnects the output instead of forcing it low.',
    'Driving one wire with two enabled controlled buffers — a conflict.',
  ],
  hints: ['Think of the control as the "open/closed switch" of the gate.'],
  assessment: ['With control = 0, what does a controlled buffer output?', 'Why is a controlled buffer useful on a shared bus?'],
}

const CON_INV: GateConcept = {
  id: 'CON_INV',
  title: 'Controlled Inverter',
  objective: 'Understand that a controlled inverter inverts while its control is high and floats otherwise.',
  prerequisites: ['NOT behavior.', 'Controlled buffer behavior.'],
  explanation: [
    'A controlled inverter combines inversion with the tri-state switch: while the control input is 1 the data input is inverted at the output; while the control is 0 the output floats (high impedance).',
    'It is the inverted twin of the controlled buffer — wherever a bus needs a selectable inverted value, this is the component to reach for.',
  ],
  visualization: [
    'An inverter triangle (with bubble) plus a control input entering from the bottom.',
    'Flip the control to 0 and the output floats instead of inverting.',
  ],
  interaction: ['With control = 1, toggle the data input and watch the output invert; set control = 0 and watch it float.'],
  commonMistakes: [
    'Expecting the disabled output to be 0 rather than high impedance.',
    'Confusing the control input with the data input.',
  ],
  hints: ['Same switch idea as the controlled buffer, plus the bubble.'],
  assessment: ['When does a controlled inverter invert?', 'What happens to its output when the control is 0?'],
}

const ODD_PARITY: GateConcept = {
  id: 'ODD_PARITY',
  title: 'Odd Parity',
  objective: 'Understand that odd parity outputs 1 when an odd number of its inputs are 1 — a generalised XOR.',
  prerequisites: ['XOR behavior.', 'Counting ones in binary.'],
  explanation: [
    'Odd parity is XOR generalised to any input count: the output is 1 whenever an odd number of inputs are 1. With two inputs it behaves exactly like XOR.',
    'Parity is the simplest error-detection scheme — adding an odd-parity bit guarantees that any transmitted word contains an odd number of ones, so a single flipped bit is always caught.',
  ],
  visualization: [
    'A gate body with the "2k+1" marker and any number of inputs.',
    'Count the ones: even count → output 0, odd count → output 1.',
  ],
  interaction: ['Add inputs and toggle them, watching the output flip every time the total count of ones becomes odd.'],
  commonMistakes: [
    'Treating odd parity like OR (parity counts, OR just asks "any one?").',
    'Losing track after adding a third input — odd parity of 1,1,1 is 1, not 0.',
  ],
  hints: ['Count the 1s; output 1 when the count is odd.'],
  assessment: ['Odd parity of 1,1,0,1 = ?', 'How does odd parity detect a single flipped bit?'],
}

const EVEN_PARITY: GateConcept = {
  id: 'EVEN_PARITY',
  title: 'Even Parity',
  objective: 'Understand that even parity outputs 1 when an even number of its inputs are 1 — the inverse of odd parity.',
  prerequisites: ['Odd parity behavior.', 'XNOR behavior.'],
  explanation: [
    'Even parity is the inverse of odd parity: the output is 1 whenever an even number of the inputs are 1. With two inputs it behaves exactly like XNOR.',
    'Together the two parity gates are the standard way to build checksums: a sender and a receiver agree on even parity, and any single-bit error is immediately flagged.',
  ],
  visualization: [
    'A gate body with the "2k" marker and any number of inputs.',
    'Count the ones: even count → output 1, odd count → output 0.',
  ],
  interaction: ['Toggle inputs and confirm the output is 1 exactly when the number of ones is even.'],
  commonMistakes: [
    'Confusing even parity with odd parity — they are exact opposites.',
    'Assuming even parity of all-zero inputs is 0 (it is 1: zero is even).',
  ],
  hints: ['Count the 1s; output 1 when the count is even — including zero ones.'],
  assessment: ['Even parity of 1,0,1 = ?', 'What does even parity output for all-zero inputs?'],
}

/** Complete concept catalog keyed by gate id, in teaching order. */
export const GATE_CONCEPTS: Readonly<Record<GateType, GateConcept>> = {
  BUFFER,
  NOT,
  AND,
  NAND,
  OR,
  NOR,
  XOR,
  XNOR,
  CON_BUF,
  CON_INV,
  ODD_PARITY,
  EVEN_PARITY,
}

/** Look up a gate concept; throws for unknown ids. */
export function getGateConcept(id: GateType): GateConcept {
  const concept = GATE_CONCEPTS[id]
  if (!concept) throw new RangeError(`unknown gate concept "${id}"`)
  return concept
}

/** All concepts in teaching order (matches the gate catalog order). */
export const GATE_CONCEPT_LIST: readonly GateConcept[] = [
  BUFFER,
  NOT,
  AND,
  NAND,
  OR,
  NOR,
  XOR,
  XNOR,
]