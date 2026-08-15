import type { GateType } from './types'
import {
  verifyAnnihilation,
  verifyAssociative,
  verifyCommutative,
  verifyComplement,
  verifyDeMorgan,
  verifyDistributive,
  verifyIdempotence,
  verifyIdentity,
  verifyInvolution,
  verifyNandUniversality,
  verifyNorUniversality,
} from './verify'

/**
 * Catalog of Boolean laws. Each law carries teaching metadata plus a
 * zero-argument verifier; gate-scoped laws are parameterized by a default
 * gate so they can also be verified for any related gate via `lawsForGate`.
 */

export type LawId =
  | 'COMMUTATIVE'
  | 'ASSOCIATIVE'
  | 'DISTRIBUTIVE'
  | 'IDENTITY'
  | 'ANNIHILATION'
  | 'IDEMPOTENCE'
  | 'INVOLUTION'
  | 'COMPLEMENT'
  | 'DEMORGAN'
  | 'NAND_UNIVERSAL'
  | 'NOR_UNIVERSAL'

export interface LawDefinition {
  readonly id: LawId
  readonly name: string
  /** Human-readable statement, e.g. "A + (B · C) = (A + B) · (A + C)". */
  readonly statement: string
  /** Gates this law is meaningful for (empty for algebra-global laws). */
  readonly relatedGates: readonly GateType[]
  /** Verify against `gateId` when the law is gate-scoped; global laws ignore it. */
  readonly verify: (gateId?: GateType) => boolean
}

const COMMUTATIVE: LawDefinition = {
  id: 'COMMUTATIVE',
  name: 'Commutative Law',
  statement: 'op(A, B) = op(B, A)',
  relatedGates: ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR'],
  verify: (g = 'AND') => verifyCommutative(g),
}

const ASSOCIATIVE: LawDefinition = {
  id: 'ASSOCIATIVE',
  name: 'Associative Law',
  statement: 'op(op(A, B), C) = op(A, op(B, C))',
  relatedGates: ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR'],
  verify: (g = 'AND') => verifyAssociative(g),
}

const DISTRIBUTIVE: LawDefinition = {
  id: 'DISTRIBUTIVE',
  name: 'Distributive Law',
  statement: 'A · (B + C) = (A · B) + (A · C) and A + (B · C) = (A + B) · (A + C)',
  relatedGates: ['AND', 'OR'],
  verify: () => verifyDistributive(),
}

const IDENTITY: LawDefinition = {
  id: 'IDENTITY',
  name: 'Identity Law',
  statement: 'op(A, identity) = A',
  relatedGates: ['AND', 'OR', 'XOR', 'BUFFER'],
  verify: (g = 'AND') => verifyIdentity(g),
}

const ANNIHILATION: LawDefinition = {
  id: 'ANNIHILATION',
  name: 'Annihilation (Domination)',
  statement: 'op(A, constant) = constant',
  relatedGates: ['AND', 'OR'],
  verify: (g = 'AND') => verifyAnnihilation(g),
}

const IDEMPOTENCE: LawDefinition = {
  id: 'IDEMPOTENCE',
  name: 'Idempotent Law',
  statement: 'op(A, A) = A',
  relatedGates: ['AND', 'OR', 'BUFFER'],
  verify: (g = 'AND') => verifyIdempotence(g),
}

const INVOLUTION: LawDefinition = {
  id: 'INVOLUTION',
  name: 'Involution (Double Negation)',
  statement: "(A')' = A",
  relatedGates: ['NOT'],
  verify: () => verifyInvolution(),
}

const COMPLEMENT: LawDefinition = {
  id: 'COMPLEMENT',
  name: 'Complement Law',
  statement: 'A · A\' = 0, A + A\' = 1, A ⊕ A\' = 1',
  relatedGates: ['AND', 'OR', 'XOR'],
  verify: (g = 'AND') => verifyComplement(g),
}

const DEMORGAN: LawDefinition = {
  id: 'DEMORGAN',
  name: "De Morgan's Law",
  statement: "(A · B)' = A' + B'  and  (A + B)' = A' · B'",
  relatedGates: ['AND', 'NAND', 'OR', 'NOR'],
  verify: (g = 'AND') => verifyDeMorgan(g),
}

const NAND_UNIVERSAL: LawDefinition = {
  id: 'NAND_UNIVERSAL',
  name: 'NAND Universality',
  statement: 'NOT, AND and OR can all be built from NAND gates alone.',
  relatedGates: ['NAND'],
  verify: () => verifyNandUniversality(),
}

const NOR_UNIVERSAL: LawDefinition = {
  id: 'NOR_UNIVERSAL',
  name: 'NOR Universality',
  statement: 'NOT, AND and OR can all be built from NOR gates alone.',
  relatedGates: ['NOR'],
  verify: () => verifyNorUniversality(),
}

/** Complete law catalog, in teaching order. */
export const LAWS: readonly LawDefinition[] = [
  COMMUTATIVE,
  ASSOCIATIVE,
  DISTRIBUTIVE,
  IDENTITY,
  ANNIHILATION,
  IDEMPOTENCE,
  INVOLUTION,
  COMPLEMENT,
  DEMORGAN,
  NAND_UNIVERSAL,
  NOR_UNIVERSAL,
]

const BY_ID: ReadonlyMap<LawId, LawDefinition> = new Map(LAWS.map((l) => [l.id, l]))

/** Look up a law definition; throws for unknown ids. */
export function getLaw(id: LawId): LawDefinition {
  const law = BY_ID.get(id)
  if (!law) throw new RangeError(`unknown law "${id}"`)
  return law
}

/**
 * Laws that actually hold for a given gate: laws whose `relatedGates` mention
 * the gate and whose verifier returns true. Purely global laws (e.g. De
 * Morgan, universality) are intentionally excluded — query `LAWS` for those.
 */
export function lawsForGate(gateId: GateType): readonly LawDefinition[] {
  return LAWS.filter((l) => l.relatedGates.includes(gateId) && l.verify(gateId))
}