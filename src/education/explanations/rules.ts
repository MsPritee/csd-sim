import type { Rule } from './types'

export const RULES = {
  COMBINATION: {
    id: 'combination',
    name: 'Combining theorem (adjacency)',
    statement:
      'Two adjacent minterms that differ in exactly one variable combine into one term with that variable eliminated.',
  },
  DISTRIBUTIVE: {
    id: 'distributive',
    name: 'Distributive law',
    statement: 'A(B + C) = AB + AC, and AB + AC = A(B + C).',
  },
  ABSORPTION: {
    id: 'absorption',
    name: 'Absorption law',
    statement: 'A + AB = A, and A(A + B) = A.',
  },
  COMPLEMENT: {
    id: 'complement',
    name: 'Complement law',
    statement: 'A + A\u2032 = 1 and A\u00b7A\u2032 = 0.',
  },
  IDENTITY: {
    id: 'identity',
    name: 'Identity law',
    statement: 'A + 0 = A and A\u00b71 = A.',
  },
  DE_MORGAN: {
    id: 'demorgan',
    name: 'De Morgan\u2019s law',
    statement: '(A + B)\u2032 = A\u2032B\u2032 and (AB)\u2032 = A\u2032 + B\u2032.',
  },
} as const satisfies Record<string, Rule>

export type RuleKey = keyof typeof RULES

export function getRule(key: RuleKey): Rule {
  return RULES[key]
}