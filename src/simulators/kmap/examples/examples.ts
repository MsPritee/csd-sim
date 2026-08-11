import type { CellValue } from '../../../core/kmap'

export interface KMapExample {
  id: string
  name: string
  description: string
  variables: string[]
  values: CellValue[]
  explanation: string
  // Enhanced fields for educational use
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  learningObjectives?: string[]
  tags?: string[]
  // Structured problem/solution model (additive; backward compatible)
  problem?: {
    variables: string[]
    values: CellValue[]
  }
  solution?: {
    sop: string
    pos: string
    groups: number[][]
  }
}

export const EXAMPLES: KMapExample[] = [
  {
    id: 'majority-3',
    name: 'Majority Function (3 variables)',
    description: 'Output is 1 when at least 2 of 3 inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 0, 0, 1, 0, 1, 1, 1], // m0-m7: 000,001,010,011,100,101,110,111
    explanation: 'Majority function: F = AB + AC + BC. Cells m3(011), m5(101), m6(110), m7(111) are 1.',
    difficulty: 'intermediate',
    learningObjectives: ['Understand grouping of adjacent cells', 'Learn variable elimination in groups'],
    tags: ['grouping', 'simplification', '3-variable'],
    problem: {
      variables: ['A', 'B', 'C'],
      values: [0, 0, 0, 1, 0, 1, 1, 1],
    },
    solution: {
      sop: 'AB + AC + BC',
      pos: '(A + B)(A + C)(B + C)',
      groups: [[3, 7], [5, 7], [6, 7]],
    },
  },
  {
    id: 'xor-2',
    name: 'XOR Function (2 variables)',
    description: 'Output is 1 when inputs are different',
    variables: ['A', 'B'],
    values: [0, 1, 1, 0], // m0-m3: 00,01,10,11
    explanation: 'XOR function: F = A\'B + AB\'. Cells m1(01) and m2(10) are 1. Cannot be simplified further.',
    difficulty: 'beginner',
    learningObjectives: ['Understand non-adjacent cells', 'Learn when simplification is not possible'],
    tags: ['2-variable', 'no-simplification', 'xor'],
    problem: {
      variables: ['A', 'B'],
      values: [0, 1, 1, 0],
    },
    solution: {
      sop: "A'B + AB'",
      pos: '(A + B)(A\' + B\')',
      groups: [[1], [2]],
    },
  },
  {
    id: 'parity-3',
    name: 'Odd Parity (3 variables)',
    description: 'Output is 1 when odd number of inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 0, 1, 0, 0, 1], // m0-m7
    explanation: 'Odd parity: F = A\'B\'C + A\'BC\' + AB\'C\' + ABC. Every other cell is 1 in checkerboard pattern.'
  },
  {
    id: 'and-3',
    name: 'AND Function (3 variables)',
    description: 'Output is 1 only when all inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 0, 0, 0, 0, 0, 0, 1], // Only m7(111) is 1
    explanation: 'AND function: F = ABC. Only cell m7(111) is 1. Simplest possible function.'
  },
  {
    id: 'or-3',
    name: 'OR Function (3 variables)',
    description: 'Output is 1 when at least one input is 1',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 1, 1, 1, 1, 1], // Only m0(000) is 0
    explanation: 'OR function: F = A + B + C. Only cell m0(000) is 0. Complement of AND function.'
  },
  {
    id: 'half-adder-sum',
    name: 'Half Adder Sum',
    description: 'Sum bit of half adder (XOR of inputs)',
    variables: ['A', 'B'],
    values: [0, 1, 1, 0], // Same as XOR
    explanation: 'Half adder sum: F = A ⊕ B = A\'B + AB\'. Used in binary addition.'
  },
  {
    id: 'half-adder-carry',
    name: 'Half Adder Carry',
    description: 'Carry bit of half adder (AND of inputs)',
    variables: ['A', 'B'],
    values: [0, 0, 0, 1], // Same as AND
    explanation: 'Half adder carry: F = AB. Generated when both inputs are 1.'
  },
  {
    id: 'adjacent-pair',
    name: 'Adjacent Pair Example',
    description: 'Simple example showing adjacent cell grouping',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 0, 0, 0, 0, 0], // m1(001) and m2(010) are 1
    explanation: 'Two adjacent 1s: F = A\'BC + AB\'C = A\'C. Shows how grouping eliminates variable B.'
  },
  {
    id: 'four-corner',
    name: 'Four-Corner Group',
    description: 'Example of wrap-around grouping in 4-variable K-map',
    variables: ['A', 'B', 'C', 'D'],
    values: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], // Corners m0,m3,m12,m15 are 1
    explanation: 'Four corners are adjacent in K-map: F = B\'D\'. Shows wrap-around adjacency.',
    difficulty: 'advanced',
    learningObjectives: ['Understand wrap-around adjacency', 'Learn 4-variable K-map corner grouping'],
    tags: ['4-variable', 'wrap-around', 'corner-grouping', 'advanced'],
    problem: {
      variables: ['A', 'B', 'C', 'D'],
      values: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    },
    solution: {
      sop: "B'D'",
      pos: "(B + D)(B' + D')",
      groups: [[0, 3, 12, 15]],
    },
  },
]

export function getExampleById(id: string): KMapExample | undefined {
  return EXAMPLES.find(ex => ex.id === id)
}

/**
 * Get examples that have a complete structured problem/solution model.
 */
export function getStructuredExamples(): KMapExample[] {
  return EXAMPLES.filter(ex => ex.problem !== undefined && ex.solution !== undefined)
}

/**
 * Get examples by difficulty level.
 */
export function getExamplesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): KMapExample[] {
  return EXAMPLES.filter(ex => ex.difficulty === difficulty)
}

/**
 * Get examples by tag.
 */
export function getExamplesByTag(tag: string): KMapExample[] {
  return EXAMPLES.filter(ex => ex.tags?.includes(tag))
}

/**
 * Get examples for a specific variable count.
 */
export function getExamplesByVariableCount(count: 2 | 3 | 4): KMapExample[] {
  return EXAMPLES.filter(ex => ex.variables.length === count)
}
