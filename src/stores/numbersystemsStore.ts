/**
 * Application-layer state for the number systems simulator (Layer 3).
 * Holds the current input values, conversion results, comparison data,
 * validation state, educational content display settings, and UI preferences.
 * Presentation reads these; actual conversions and validations are orchestrated
 * by the application layer (`application/numbersystems`).
 */

import { create } from 'zustand'
import type { NumberSystem } from '../core/numbersystems/types'
import type {
  ConversionRequest,
  ConversionResponse,
  ComparisonRequest,
  ComparisonResponse,
  ValidationRequest,
  ValidationResponse,
  BitAnalysisResponse,
} from '../application/numbersystems/types'
import {
  orchestrateConversion,
  convertToAllSystems,
  quickConvert,
  educationalConvert,
} from '../application/numbersystems/conversion'
import {
  compareAcrossAllSystems,
  createComparisonTable,
  compareTwoValues,
  generateConversionMatrix,
} from '../application/numbersystems/comparison'
import {
  validateNumberSystemInput,
} from '../application/numbersystems/validation'

/**
 * Input value state for each number system.
 */
export interface NumberSystemInput {
  readonly value: string
  readonly isValid: boolean
  readonly error?: string
}

/**
 * Conversion history entry for undo/redo functionality.
 */
export interface ConversionHistoryEntry {
  readonly timestamp: number
  readonly request: ConversionRequest
  readonly response: ConversionResponse
}

/**
 * Complete state for the number systems simulator.
 */
export interface NumberSystemsState {
  // Input state for each number system
  decimalInput: NumberSystemInput
  binaryInput: NumberSystemInput
  hexadecimalInput: NumberSystemInput
  octalInput: NumberSystemInput

  // Current conversion settings
  sourceSystem: NumberSystem
  targetSystem: NumberSystem
  showSteps: boolean
  useShortcuts: boolean

  // Conversion results
  currentConversion: ConversionResponse | null
  allConversions: ConversionResponse[] | null

  // Comparison state
  comparisonValue: string
  comparisonBaseSystem: NumberSystem
  comparisonResult: ComparisonResponse | null
  comparisonTable: {
    success: boolean
    data?: {
      decimal: string
      binary: string
      hexadecimal: string
      octal: string
      bitLength: number
      binaryGrouped: string
      nibbles: string[]
      octalGroups: string[]
      onesCount: number
      zerosCount: number
      isPowerOfTwo: boolean
    }
    error?: string
  } | null

  // Validation state
  validationResult: ValidationResponse | null
  bitAnalysisResult: BitAnalysisResponse | null

  // History for undo/redo
  conversionHistory: readonly ConversionHistoryEntry[]
  historyIndex: number

  // UI preferences
  showAdvancedVisualization: boolean
  showConversionMatrix: boolean
  maxBits: number

  // Visual state
  visualMode: 'text' | 'visual'
  animationSpeed: number
  currentStep: number
  isPlaying: boolean
  showHints: boolean
  practiceMode: boolean

  // Actions - Input management
  setDecimalInput: (value: string) => void
  setBinaryInput: (value: string) => void
  setHexadecimalInput: (value: string) => void
  setOctalInput: (value: string) => void
  clearAllInputs: () => void

  // Actions - Conversion settings
  setSourceSystem: (system: NumberSystem) => void
  setTargetSystem: (system: NumberSystem) => void
  setShowSteps: (show: boolean) => void
  setUseShortcuts: (use: boolean) => void

  // Actions - Conversion operations
  performConversion: () => void
  performQuickConversion: () => void
  performEducationalConversion: () => void
  convertToAllSystems: () => void

  // Actions - Comparison operations
  setComparisonValue: (value: string) => void
  setComparisonBaseSystem: (system: NumberSystem) => void
  performComparison: () => void
  performComparisonTable: () => void
  compareTwoValues: (value1: string, value2: string) => void
  generateConversionMatrix: () => void

  // Actions - Validation operations
  validateCurrentInput: () => void
  performBitAnalysis: () => void

  // Actions - History management
  undo: () => void
  redo: () => void
  clearHistory: () => void

  // Actions - UI preferences
  setShowAdvancedVisualization: (show: boolean) => void
  setShowConversionMatrix: (show: boolean) => void
  setMaxBits: (bits: number) => void

  // Actions - Visual state
  setVisualMode: (mode: 'text' | 'visual') => void
  setAnimationSpeed: (speed: number) => void
  setCurrentStep: (step: number) => void
  setIsPlaying: (playing: boolean) => void
  setShowHints: (show: boolean) => void
  setPracticeMode: (enabled: boolean) => void

  // Actions - Reset
  resetState: () => void
}

/**
 * Creates an empty input state.
 */
function createEmptyInput(): NumberSystemInput {
  return { value: '', isValid: true }
}

/**
 * Validates input for a specific number system.
 */
function validateInput(value: string, system: NumberSystem): NumberSystemInput {
  const validation = validateNumberSystemInput({ value, system })
  return {
    value,
    isValid: validation.isValid,
    error: validation.error,
  }
}

/**
 * Gets the current input value for the specified system.
 */
function getInputForSystem(
  state: Pick<NumberSystemsState, 'decimalInput' | 'binaryInput' | 'hexadecimalInput' | 'octalInput'>,
  system: NumberSystem,
): string {
  switch (system) {
    case 'decimal':
      return state.decimalInput.value
    case 'binary':
      return state.binaryInput.value
    case 'hexadecimal':
      return state.hexadecimalInput.value
    case 'octal':
      return state.octalInput.value
  }
}

export const useNumberSystemsStore = create<NumberSystemsState>((set, get) => ({
  // Initial state
  decimalInput: createEmptyInput(),
  binaryInput: createEmptyInput(),
  hexadecimalInput: createEmptyInput(),
  octalInput: createEmptyInput(),

  sourceSystem: 'decimal',
  targetSystem: 'binary',
  showSteps: true,
  useShortcuts: true,

  currentConversion: null,
  allConversions: null,

  comparisonValue: '',
  comparisonBaseSystem: 'decimal',
  comparisonResult: null,
  comparisonTable: null,

  validationResult: null,
  bitAnalysisResult: null,

  conversionHistory: [],
  historyIndex: -1,

  showAdvancedVisualization: false,
  showConversionMatrix: false,
  maxBits: 32,

  // Visual state
  visualMode: 'text',
  animationSpeed: 1000,
  currentStep: 0,
  isPlaying: false,
  showHints: true,
  practiceMode: false,

  // Input management actions
  setDecimalInput: (value) =>
    set(() => ({
      decimalInput: validateInput(value, 'decimal'),
      validationResult: null,
    })),

  setBinaryInput: (value) =>
    set(() => ({
      binaryInput: validateInput(value, 'binary'),
      validationResult: null,
    })),

  setHexadecimalInput: (value) =>
    set(() => ({
      hexadecimalInput: validateInput(value, 'hexadecimal'),
      validationResult: null,
    })),

  setOctalInput: (value) =>
    set(() => ({
      octalInput: validateInput(value, 'octal'),
      validationResult: null,
    })),

  clearAllInputs: () =>
    set({
      decimalInput: createEmptyInput(),
      binaryInput: createEmptyInput(),
      hexadecimalInput: createEmptyInput(),
      octalInput: createEmptyInput(),
      currentConversion: null,
      allConversions: null,
      validationResult: null,
      bitAnalysisResult: null,
    }),

  // Conversion settings actions
  setSourceSystem: (system) =>
    set({
      sourceSystem: system,
      currentConversion: null,
    }),

  setTargetSystem: (system) =>
    set({
      targetSystem: system,
      currentConversion: null,
    }),

  setShowSteps: (show) => set({ showSteps: show }),

  setUseShortcuts: (use) => set({ useShortcuts: use }),

  // Conversion operations
  performConversion: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({
        currentConversion: {
          success: false,
          fromSystem: state.sourceSystem,
          toSystem: state.targetSystem,
          error: 'No input value provided',
        },
      })
      return
    }

    const request: ConversionRequest = {
      value: inputValue,
      fromSystem: state.sourceSystem,
      toSystem: state.targetSystem,
      showSteps: state.showSteps,
      useShortcuts: state.useShortcuts,
    }

    const response = orchestrateConversion(request)

    // Add to history
    const historyEntry: ConversionHistoryEntry = {
      timestamp: Date.now(),
      request,
      response,
    }

    set((prevState) => ({
      currentConversion: response,
      conversionHistory: [...prevState.conversionHistory.slice(0, prevState.historyIndex + 1), historyEntry],
      historyIndex: prevState.conversionHistory.length,
    }))
  },

  performQuickConversion: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({
        currentConversion: {
          success: false,
          fromSystem: state.sourceSystem,
          toSystem: state.targetSystem,
          error: 'No input value provided',
        },
      })
      return
    }

    const response = quickConvert(inputValue, state.sourceSystem, state.targetSystem)

    set({ currentConversion: response })
  },

  performEducationalConversion: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({
        currentConversion: {
          success: false,
          fromSystem: state.sourceSystem,
          toSystem: state.targetSystem,
          error: 'No input value provided',
        },
      })
      return
    }

    const response = educationalConvert(inputValue, state.sourceSystem, state.targetSystem)

    set({ currentConversion: response })
  },

  convertToAllSystems: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({ allConversions: null })
      return
    }

    const results = convertToAllSystems(inputValue, state.sourceSystem)
    set({ allConversions: results })
  },

  // Comparison operations
  setComparisonValue: (value) =>
    set({
      comparisonValue: value,
      comparisonResult: null,
      comparisonTable: null,
    }),

  setComparisonBaseSystem: (system) =>
    set({
      comparisonBaseSystem: system,
      comparisonResult: null,
      comparisonTable: null,
    }),

  performComparison: () => {
    const state = get()

    if (!state.comparisonValue) {
      set({
        comparisonResult: {
          success: false,
          baseSystem: state.comparisonBaseSystem,
          comparisons: {
            decimal: '',
            binary: '',
            hexadecimal: '',
            octal: '',
          },
          error: 'No comparison value provided',
        },
      })
      return
    }

    const request: ComparisonRequest = {
      value: state.comparisonValue,
      baseSystem: state.comparisonBaseSystem,
    }

    const response = compareAcrossAllSystems(request)
    set({ comparisonResult: response })
  },

  performComparisonTable: () => {
    const state = get()

    if (!state.comparisonValue) {
      set({
        comparisonTable: {
          success: false,
          error: 'No comparison value provided',
        },
      })
      return
    }

    const table = createComparisonTable(state.comparisonValue, state.comparisonBaseSystem)
    set({ comparisonTable: table })
  },

  compareTwoValues: (value1, value2) => {
    const state = get()
    const result = compareTwoValues(value1, value2, state.comparisonBaseSystem)
    // Store this in a temporary location or handle as needed
    console.log('Two values comparison:', result)
  },

  generateConversionMatrix: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      console.log('No input value for conversion matrix')
      return
    }

    const matrix = generateConversionMatrix(inputValue, state.sourceSystem)
    console.log('Conversion matrix:', matrix)
  },

  // Validation operations
  validateCurrentInput: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({
        validationResult: {
          success: true,
          isValid: false,
          error: 'No input to validate',
        },
      })
      return
    }

    const request: ValidationRequest = {
      value: inputValue,
      system: state.sourceSystem,
    }

    const response = validateNumberSystemInput(request)
    set({ validationResult: response })
  },

  performBitAnalysis: () => {
    const state = get()
    const inputValue = getInputForSystem(state, state.sourceSystem)

    if (!inputValue) {
      set({
        bitAnalysisResult: {
          success: false,
          binary: '',
          bitCount: 0,
          onesCount: 0,
          zerosCount: 0,
          nibbles: [],
          octalGroups: [],
          isPowerOfTwo: false,
          error: 'No input value for bit analysis',
        },
      })
      return
    }

    // First convert to binary for analysis
    const conversion = quickConvert(inputValue, state.sourceSystem, 'binary')
    
    if (!conversion.success || !conversion.result) {
      set({
        bitAnalysisResult: {
          success: false,
          binary: '',
          bitCount: 0,
          onesCount: 0,
          zerosCount: 0,
          nibbles: [],
          octalGroups: [],
          isPowerOfTwo: false,
          error: conversion.error || 'Failed to convert to binary',
        },
      })
      return
    }

    const binaryString = conversion.result as string
    const onesCount = (binaryString.match(/1/g) || []).length
    const zerosCount = (binaryString.match(/0/g) || []).length
    const bitCount = binaryString.length

    // Extract nibbles (4-bit groups)
    const nibbles: string[] = []
    for (let i = 0; i < binaryString.length; i += 4) {
      nibbles.push(binaryString.slice(i, i + 4))
    }

    // Extract octal groups (3-bit groups)
    const octalGroups: string[] = []
    for (let i = 0; i < binaryString.length; i += 3) {
      octalGroups.push(binaryString.slice(i, i + 3))
    }

    // Check if power of two
    const decimalValue = parseInt(binaryString, 2)
    const isPowerOfTwo = decimalValue > 0 && (decimalValue & (decimalValue - 1)) === 0

    set({
      bitAnalysisResult: {
        success: true,
        binary: binaryString,
        bitCount,
        onesCount,
        zerosCount,
        nibbles,
        octalGroups,
        isPowerOfTwo,
      },
    })
  },

  // History management
  undo: () => {
    const state = get()
    if (state.historyIndex <= 0) return

    const newIndex = state.historyIndex - 1
    const previousEntry = state.conversionHistory[newIndex]

    if (previousEntry) {
      set({
        historyIndex: newIndex,
        currentConversion: previousEntry.response,
        sourceSystem: previousEntry.request.fromSystem,
        targetSystem: previousEntry.request.toSystem,
      })
    }
  },

  redo: () => {
    const state = get()
    if (state.historyIndex >= state.conversionHistory.length - 1) return

    const newIndex = state.historyIndex + 1
    const nextEntry = state.conversionHistory[newIndex]

    if (nextEntry) {
      set({
        historyIndex: newIndex,
        currentConversion: nextEntry.response,
        sourceSystem: nextEntry.request.fromSystem,
        targetSystem: nextEntry.request.toSystem,
      })
    }
  },

  clearHistory: () =>
    set({
      conversionHistory: [],
      historyIndex: -1,
    }),

  // UI preferences
  setShowAdvancedVisualization: (show) => set({ showAdvancedVisualization: show }),

  setShowConversionMatrix: (show) => set({ showConversionMatrix: show }),

  setMaxBits: (bits) => set({ maxBits: bits }),

  // Visual state actions
  setVisualMode: (mode) => set({ visualMode: mode }),

  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setShowHints: (show) => set({ showHints: show }),

  setPracticeMode: (enabled) => set({ practiceMode: enabled }),

  // Reset
  resetState: () =>
    set({
      decimalInput: createEmptyInput(),
      binaryInput: createEmptyInput(),
      hexadecimalInput: createEmptyInput(),
      octalInput: createEmptyInput(),
      sourceSystem: 'decimal',
      targetSystem: 'binary',
      showSteps: true,
      useShortcuts: true,
      currentConversion: null,
      allConversions: null,
      comparisonValue: '',
      comparisonBaseSystem: 'decimal',
      comparisonResult: null,
      comparisonTable: null,
      validationResult: null,
      bitAnalysisResult: null,
      conversionHistory: [],
      historyIndex: -1,
      showAdvancedVisualization: false,
      showConversionMatrix: false,
      maxBits: 32,
      visualMode: 'text',
      animationSpeed: 1000,
      currentStep: 0,
      isPlaying: false,
      showHints: true,
      practiceMode: false,
    }),
}))
