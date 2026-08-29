/**
 * NumberSystemsSimulator - Main simulator component
 * Integrates conversion, comparison, and visualization for number systems
 * Now includes sidebar navigation and educational content
 */

import { useState, useEffect } from 'react'
import type { NumberSystem } from '../../core/numbersystems/types'
import { NumberSystemSelector } from './NumberSystemSelector'
import { ConversionMatrix } from './ConversionMatrix'
import { AdvancedVisualization } from './AdvancedVisualization'
import { ConversionResult } from './ConversionResult'
import { PositionValueVisualizer } from './PositionValueVisualizer'
import { BitGroupingVisualizer } from './BitGroupingVisualizer'
import { ConversionAnimator } from './ConversionAnimator'
import { ConversionPractice } from './ConversionPractice'
import { ExplorationMode } from './ExplorationMode'
import { DecimalToBinaryVisualizer } from './DecimalToBinaryVisualizer'
import { BinaryToDecimalVisualizer } from './BinaryToDecimalVisualizer'
import { createBitGroupingSteps, createPositionValueSteps } from './AnimationAdapters'
import { NumberSystemsSidebar } from './NumberSystemsSidebar'
import { NumberSystemEducation } from './NumberSystemEducation'
import { DecimalLearnModule } from './learn/DecimalLearnModule'
import { BinaryLearnModule } from './learn/binary/BinaryLearnModule'
import { OctalLearnModule } from './learn/octal/OctalLearnModule'
import { HexadecimalLearnModule } from './learn/hexadecimal/HexadecimalLearnModule'
import { Button, Input, Card } from '../../components/ui'
import {
  orchestrateConversion,
  calculatePositionValues,
} from '../../application/numbersystems/conversion'
import {
  compareAcrossAllSystems,
  createComparisonTable,
  generateConversionMatrix,
} from '../../application/numbersystems/comparison'

interface NumberSystemsSimulatorProps {
  onBackToHome: () => void
}

type NumberSystemType = 'decimal' | 'binary' | 'octal' | 'hexadecimal' | 'bcd' | 'excess3' | 'graycode' | null
type ConversionType = 'decimal-to-binary' | 'binary-to-decimal' | 'decimal-to-octal' | 'octal-to-decimal' | 'decimal-to-hex' | 'hex-to-decimal' | null
type DecimalSubType = 'education' | 'learn' | null
type BinarySubType = 'education' | 'learn' | null
type OctalSubType = 'education' | 'learn' | null
type HexadecimalSubType = 'education' | 'learn' | null

export function NumberSystemsSimulator({ onBackToHome }: NumberSystemsSimulatorProps) {
  // New sidebar state
  const [selectedNumberSystem, setSelectedNumberSystem] = useState<NumberSystemType>(null)
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>(null)
  const [selectedDecimalSub, setSelectedDecimalSub] = useState<DecimalSubType>(null)
  const [selectedBinarySub, setSelectedBinarySub] = useState<BinarySubType>(null)
  const [selectedOctalSub, setSelectedOctalSub] = useState<OctalSubType>(null)
  const [selectedHexadecimalSub, setSelectedHexadecimalSub] = useState<HexadecimalSubType>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      
      // Auto-collapse sidebar on mobile
      if (width < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarCollapsed])
  
  // Original state for converter
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [showExplorationMode, setShowExplorationMode] = useState(false)
  const [showDecimalToBinaryVisualizer, setShowDecimalToBinaryVisualizer] = useState(false)
  const [showBinaryToDecimalVisualizer, setShowBinaryToDecimalVisualizer] = useState(false)
  const [fromSystem, setFromSystem] = useState<NumberSystem>('decimal')
  const [toSystem, setToSystem] = useState<NumberSystem>('binary')
  const [inputValue, setInputValue] = useState<string>('10')
  const [showMatrix, setShowMatrix] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPositionValues, setShowPositionValues] = useState(false)
  const [showBitGrouping, setShowBitGrouping] = useState(false)
  const [useUnifiedAnimator, setUseUnifiedAnimator] = useState(false)
  const [conversionResult, setConversionResult] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [matrixData, setMatrixData] = useState<Record<string, string>>({})
  const [positionValueData, setPositionValueData] = useState<any>(null)
  const [binaryForGrouping, setBinaryForGrouping] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Handle conversion selection from sidebar
  const handleConversionSelect = (conversion: ConversionType) => {
    setSelectedConversion(conversion)
    setSelectedNumberSystem(null)
    setSelectedDecimalSub(null)
    setSelectedBinarySub(null)
    setSelectedOctalSub(null)
    setSelectedHexadecimalSub(null)
    
    // Map conversion to from/to systems
    switch (conversion) {
      case 'decimal-to-binary':
        setFromSystem('decimal')
        setToSystem('binary')
        break
      case 'binary-to-decimal':
        setFromSystem('binary')
        setToSystem('decimal')
        break
      case 'decimal-to-octal':
        setFromSystem('decimal')
        setToSystem('octal')
        break
      case 'octal-to-decimal':
        setFromSystem('octal')
        setToSystem('decimal')
        break
      case 'decimal-to-hex':
        setFromSystem('decimal')
        setToSystem('hexadecimal')
        break
      case 'hex-to-decimal':
        setFromSystem('hexadecimal')
        setToSystem('decimal')
        break
    }
    
    // Reset visualizer states
    setShowDecimalToBinaryVisualizer(false)
    setShowBinaryToDecimalVisualizer(false)
  }

  // Handle decimal sub-selection from sidebar
  const handleDecimalSubSelect = (subtype: DecimalSubType) => {
    console.log('handleDecimalSubSelect called with:', subtype)
    if (subtype !== null) {
      setSelectedNumberSystem('decimal')
    }
    setSelectedDecimalSub(subtype)
    setSelectedConversion(null)
    setSelectedBinarySub(null)
    setSelectedOctalSub(null)
    setSelectedHexadecimalSub(null)
  }

  // Handle binary sub-selection from sidebar
  const handleBinarySubSelect = (subtype: BinarySubType) => {
    console.log('handleBinarySubSelect called with:', subtype)
    if (subtype !== null) {
      setSelectedNumberSystem('binary')
    }
    setSelectedBinarySub(subtype)
    setSelectedConversion(null)
    setSelectedDecimalSub(null)
    setSelectedOctalSub(null)
    setSelectedHexadecimalSub(null)
  }

  // Handle octal sub-selection from sidebar
  const handleOctalSubSelect = (subtype: OctalSubType) => {
    console.log('handleOctalSubSelect called with:', subtype)
    if (subtype !== null) {
      setSelectedNumberSystem('octal')
    }
    setSelectedOctalSub(subtype)
    setSelectedConversion(null)
    setSelectedDecimalSub(null)
    setSelectedBinarySub(null)
    setSelectedHexadecimalSub(null)
  }

  // Handle hexadecimal sub-selection from sidebar
  const handleHexadecimalSubSelect = (subtype: HexadecimalSubType) => {
    console.log('handleHexadecimalSubSelect called with:', subtype)
    if (subtype !== null) {
      setSelectedNumberSystem('hexadecimal')
    }
    setSelectedHexadecimalSub(subtype)
    setSelectedConversion(null)
    setSelectedDecimalSub(null)
    setSelectedBinarySub(null)
    setSelectedOctalSub(null)
  }

  // Practice mode - show separate component
  if (showPracticeMode) {
    return <ConversionPractice onBackToHome={() => setShowPracticeMode(false)} />
  }

  // Exploration mode - show separate component
  if (showExplorationMode) {
    return <ExplorationMode onBackToHome={() => setShowExplorationMode(false)} />
  }

  // Decimal to Binary Visualizer - show separate component
  if (showDecimalToBinaryVisualizer) {
    const decimalValue = parseInt(inputValue, 10)
    return (
      <div>
        <nav
          className="px-4 py-1.5 flex items-center gap-4 border-b"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowDecimalToBinaryVisualizer(false)}
            className="font-medium"
          >
            Back to Converter
          </Button>
        </nav>
        <div
          className="flex-1 p-6"
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <DecimalToBinaryVisualizer decimalValue={decimalValue} />
          </div>
        </div>
      </div>
    )
  }

  // Binary to Decimal Visualizer - show separate component
  if (showBinaryToDecimalVisualizer) {
    return (
      <div>
        <nav
          className="px-4 py-1.5 flex items-center gap-4 border-b"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowBinaryToDecimalVisualizer(false)}
            className="font-medium"
          >
            Back to Converter
          </Button>
        </nav>
        <div
          className="flex-1 p-6"
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <BinaryToDecimalVisualizer binaryValue={inputValue} />
          </div>
        </div>
      </div>
    )
  }

  const handleConvert = () => {
    setLoading(true)

    // Perform conversion
    const result = orchestrateConversion({
      value: inputValue,
      fromSystem,
      toSystem,
      showSteps: true,
      useShortcuts: true,
    })

    setConversionResult(result)

    // Get comparison data
    const comparison = compareAcrossAllSystems({
      value: inputValue,
      baseSystem: fromSystem,
    })

    if (comparison.success) {
      const table = createComparisonTable(inputValue, fromSystem)
      if (table.success && table.data) {
        setComparisonData(table.data)
      }
    }

    // Generate conversion matrix if enabled
    if (showMatrix) {
      const matrix = generateConversionMatrix(inputValue, fromSystem)
      if (matrix.success && matrix.matrix) {
        setMatrixData(matrix.matrix)
      }
    }

    // Calculate position values if enabled and applicable
    if (showPositionValues && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal')) {
      const positionValues = calculatePositionValues(inputValue, fromSystem)
      setPositionValueData(positionValues)
    }

    // Update bit grouping if already enabled
    if (showBitGrouping) {
      handleToggleBitGrouping()
    }

    setLoading(false)
  }

  const handleToggleMatrix = () => {
    setShowMatrix(!showMatrix)
    if (!showMatrix) {
      const matrix = generateConversionMatrix(inputValue, fromSystem)
      if (matrix.success && matrix.matrix) {
        setMatrixData(matrix.matrix)
      }
    }
  }

  const handleTogglePositionValues = () => {
    setShowPositionValues(!showPositionValues)
    if (!showPositionValues && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal')) {
      const positionValues = calculatePositionValues(inputValue, fromSystem)
      setPositionValueData(positionValues)
    }
  }

  const handleToggleBitGrouping = () => {
    const newState = !showBitGrouping
    setShowBitGrouping(newState)
    
    if (newState) {
      // Prepare binary value for bit grouping
      let groupingBinary = ''
      if (fromSystem === 'binary') {
        groupingBinary = inputValue
      } else {
        // Convert to binary first
        const toBinary = orchestrateConversion({
          value: inputValue,
          fromSystem,
          toSystem: 'binary',
          showSteps: false,
        })
        if (toBinary.success && toBinary.result) {
          groupingBinary = toBinary.result
        }
      }
      setBinaryForGrouping(groupingBinary)
    }
  }

  // Show educational content or learn module when decimal is selected with sub-option
  console.log('Rendering check - selectedNumberSystem:', selectedNumberSystem, 'selectedDecimalSub:', selectedDecimalSub)
  if (selectedNumberSystem === 'decimal' && selectedDecimalSub) {
    return (
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)' 
            }}
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        )}
        
        <NumberSystemsSidebar
          onNumberSystemSelect={setSelectedNumberSystem}
          onConversionSelect={handleConversionSelect}
          onDecimalSubSelect={handleDecimalSubSelect}
          onBinarySubSelect={handleBinarySubSelect}
          onOctalSubSelect={handleOctalSubSelect}
          onHexadecimalSubSelect={handleHexadecimalSubSelect}
          selectedNumberSystem={selectedNumberSystem}
          selectedConversion={selectedConversion}
          selectedDecimalSub={selectedDecimalSub}
          selectedBinarySub={selectedBinarySub}
          selectedOctalSub={selectedOctalSub}
          selectedHexadecimalSub={selectedHexadecimalSub}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />
        
        {/* Mobile sidebar overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {selectedDecimalSub === 'education' ? (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <nav className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDecimalSub(null)}
                  className="font-medium"
                >
                  Back to Decimal
                </Button>
              </nav>
              <NumberSystemEducation system={selectedNumberSystem} />
            </div>
          ) : (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <DecimalLearnModule onBackToHome={() => setSelectedDecimalSub(null)} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show educational content or learn module when binary is selected with sub-option
  if (selectedNumberSystem === 'binary' && selectedBinarySub) {
    return (
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)' 
            }}
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        )}
        
        <NumberSystemsSidebar
          onNumberSystemSelect={setSelectedNumberSystem}
          onConversionSelect={handleConversionSelect}
          onDecimalSubSelect={handleDecimalSubSelect}
          onBinarySubSelect={handleBinarySubSelect}
          onOctalSubSelect={handleOctalSubSelect}
          onHexadecimalSubSelect={handleHexadecimalSubSelect}
          selectedNumberSystem={selectedNumberSystem}
          selectedConversion={selectedConversion}
          selectedDecimalSub={selectedDecimalSub}
          selectedBinarySub={selectedBinarySub}
          selectedOctalSub={selectedOctalSub}
          selectedHexadecimalSub={selectedHexadecimalSub}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />
        
        {/* Mobile sidebar overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {selectedBinarySub === 'education' ? (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <nav className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBinarySub(null)}
                  className="font-medium"
                >
                  Back to Binary
                </Button>
              </nav>
              <NumberSystemEducation system={selectedNumberSystem} />
            </div>
          ) : (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <BinaryLearnModule onBackToHome={() => setSelectedBinarySub(null)} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show educational content or learn module when octal is selected with sub-option
  if (selectedNumberSystem === 'octal' && selectedOctalSub) {
    return (
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)' 
            }}
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        )}
        
        <NumberSystemsSidebar
          onNumberSystemSelect={setSelectedNumberSystem}
          onConversionSelect={handleConversionSelect}
          onDecimalSubSelect={handleDecimalSubSelect}
          onBinarySubSelect={handleBinarySubSelect}
          onOctalSubSelect={handleOctalSubSelect}
          onHexadecimalSubSelect={handleHexadecimalSubSelect}
          selectedNumberSystem={selectedNumberSystem}
          selectedConversion={selectedConversion}
          selectedDecimalSub={selectedDecimalSub}
          selectedBinarySub={selectedBinarySub}
          selectedOctalSub={selectedOctalSub}
          selectedHexadecimalSub={selectedHexadecimalSub}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />
        
        {/* Mobile sidebar overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {selectedOctalSub === 'education' ? (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <nav className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOctalSub(null)}
                  className="font-medium"
                >
                  Back to Octal
                </Button>
              </nav>
              <NumberSystemEducation system={selectedNumberSystem} />
            </div>
          ) : (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <OctalLearnModule onBackToHome={() => setSelectedOctalSub(null)} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show educational content or learn module when hexadecimal is selected with sub-option
  if (selectedNumberSystem === 'hexadecimal' && selectedHexadecimalSub) {
    return (
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)' 
            }}
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        )}
        
        <NumberSystemsSidebar
          onNumberSystemSelect={setSelectedNumberSystem}
          onConversionSelect={handleConversionSelect}
          onDecimalSubSelect={handleDecimalSubSelect}
          onBinarySubSelect={handleBinarySubSelect}
          onOctalSubSelect={handleOctalSubSelect}
          onHexadecimalSubSelect={handleHexadecimalSubSelect}
          selectedNumberSystem={selectedNumberSystem}
          selectedConversion={selectedConversion}
          selectedDecimalSub={selectedDecimalSub}
          selectedBinarySub={selectedBinarySub}
          selectedOctalSub={selectedOctalSub}
          selectedHexadecimalSub={selectedHexadecimalSub}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />
        
        {/* Mobile sidebar overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {selectedHexadecimalSub === 'education' ? (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <nav className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedHexadecimalSub(null)}
                  className="font-medium"
                >
                  Back to Hexadecimal
                </Button>
              </nav>
              <NumberSystemEducation system={selectedNumberSystem} />
            </div>
          ) : (
            <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
              <HexadecimalLearnModule onBackToHome={() => setSelectedHexadecimalSub(null)} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show educational content for other number systems
  if (selectedNumberSystem && selectedNumberSystem !== 'decimal' && selectedNumberSystem !== 'binary' && selectedNumberSystem !== 'octal' && selectedNumberSystem !== 'hexadecimal') {
    return (
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)' 
            }}
            aria-label="Toggle sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        )}
        
        <NumberSystemsSidebar
          onNumberSystemSelect={setSelectedNumberSystem}
          onConversionSelect={handleConversionSelect}
          onDecimalSubSelect={handleDecimalSubSelect}
          onBinarySubSelect={handleBinarySubSelect}
          onOctalSubSelect={handleOctalSubSelect}
          onHexadecimalSubSelect={handleHexadecimalSubSelect}
          selectedNumberSystem={selectedNumberSystem}
          selectedConversion={selectedConversion}
          selectedDecimalSub={selectedDecimalSub}
          selectedBinarySub={selectedBinarySub}
          selectedOctalSub={selectedOctalSub}
          selectedHexadecimalSub={selectedHexadecimalSub}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
        />
        
        {/* Mobile sidebar overlay */}
        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div
          className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
            <nav className="mb-6">
              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="font-medium"
              >
                Back to Home
              </Button>
            </nav>
            <NumberSystemEducation system={selectedNumberSystem} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 relative">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="absolute top-4 left-4 z-50 p-2 rounded-lg border shadow-lg"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)' 
          }}
          aria-label="Toggle sidebar"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileSidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      )}
      
      <NumberSystemsSidebar
        onNumberSystemSelect={setSelectedNumberSystem}
        onConversionSelect={handleConversionSelect}
        onDecimalSubSelect={handleDecimalSubSelect}
        onBinarySubSelect={handleBinarySubSelect}
        onOctalSubSelect={handleOctalSubSelect}
        onHexadecimalSubSelect={handleHexadecimalSubSelect}
        selectedNumberSystem={selectedNumberSystem}
        selectedConversion={selectedConversion}
        selectedDecimalSub={selectedDecimalSub}
        selectedBinarySub={selectedBinarySub}
        selectedOctalSub={selectedOctalSub}
        selectedHexadecimalSub={selectedHexadecimalSub}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Mobile sidebar overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-80'} ${isMobile ? 'ml-0' : ''}`}>
        <nav
          className={`flex items-center gap-4 border-b ${isMobile ? 'px-4 py-3' : 'px-4 py-1.5'}`}
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="font-medium"
          >
            Back to Home
          </Button>
        </nav>
        <div
          className={`flex-1 ${isMobile ? 'p-4 pt-16' : 'p-6'}`}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className={`${isMobile ? 'max-w-full' : 'max-w-6xl mx-auto'} space-y-6`}>
          <Card
            title="Number Systems Converter"
            subtitle="Convert between decimal, binary, hexadecimal, and octal number systems with step-by-step explanations."
          >
            <NumberSystemSelector
              fromSystem={fromSystem}
              toSystem={toSystem}
              onFromSystemChange={setFromSystem}
              onToSystemChange={setToSystem}
            />

            <div className="mt-6">
              <Input
                value={inputValue}
                onChange={setInputValue}
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                placeholder={`Enter ${fromSystem} value`}
                label="Enter Value"
              />
            </div>

            <div className={`mt-6 flex flex-wrap gap-3 ${isMobile ? 'flex-col' : ''}`}>
              <Button
                onClick={handleConvert}
                disabled={loading}
                loading={loading}
                variant="primary"
                className={isMobile ? 'w-full py-3' : ''}
              >
                Convert
              </Button>

              <Button
                onClick={handleToggleMatrix}
                variant="secondary"
                className={isMobile ? 'w-full py-3' : ''}
              >
                {showMatrix ? 'Hide Matrix' : 'Show Matrix'}
              </Button>

              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="success"
                className={isMobile ? 'w-full py-3' : ''}
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </Button>

              {(fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && (
                <Button
                  onClick={handleTogglePositionValues}
                  variant="warning"
                  className={isMobile ? 'w-full py-3' : ''}
                >
                  {showPositionValues ? 'Hide Position Values' : 'Show Position Values'}
                </Button>
              )}

              <Button
                onClick={handleToggleBitGrouping}
                variant="secondary"
                className={isMobile ? 'w-full py-3' : ''}
              >
                {showBitGrouping ? 'Hide Bit Grouping' : 'Show Bit Grouping'}
              </Button>

              <Button
                onClick={() => setUseUnifiedAnimator(!useUnifiedAnimator)}
                variant="secondary"
                className={isMobile ? 'w-full py-3' : ''}
              >
                {useUnifiedAnimator ? 'Use Classic Animation' : 'Use Unified Animator'}
              </Button>

              {fromSystem === 'decimal' && toSystem === 'binary' && (
                <Button
                  onClick={() => setShowDecimalToBinaryVisualizer(true)}
                  variant="success"
                  className={isMobile ? 'w-full py-3' : ''}
                >
                  Visual Division Mode
                </Button>
              )}

              {fromSystem === 'binary' && toSystem === 'decimal' && (
                <Button
                  onClick={() => setShowBinaryToDecimalVisualizer(true)}
                  variant="success"
                  className={isMobile ? 'w-full py-3' : ''}
                >
                  Visual Position Mode
                </Button>
              )}

              <Button
                onClick={() => setShowPracticeMode(true)}
                variant="success"
                className={isMobile ? 'w-full py-3' : ''}
              >
                Practice Mode
              </Button>

              <Button
                onClick={() => setShowExplorationMode(true)}
                variant="secondary"
                className={isMobile ? 'w-full py-3' : ''}
              >
                Exploration Mode
              </Button>
            </div>
          </Card>

          {/* Conversion Result */}
          <ConversionResult
            fromSystem={fromSystem}
            toSystem={toSystem}
            inputValue={inputValue}
            result={conversionResult}
          />

          {/* Conversion Matrix */}
          {showMatrix && (
            <ConversionMatrix
              value={inputValue}
              baseSystem={fromSystem}
              matrix={matrixData}
              loading={loading}
            />
          )}

          {/* Advanced Visualization */}
          {showAdvanced && comparisonData && (
            <AdvancedVisualization
              binary={comparisonData.binary}
              hexadecimal={comparisonData.hexadecimal}
              octal={comparisonData.octal}
              bitGrouping={{
                success: true,
                nibbles: comparisonData.nibbles.map((n: string) => ({
                  bits: n.split('').map((b: string) => (b === '1' ? 1 : 0)) as any,
                  hexDigit: parseInt(n, 16).toString(16).toUpperCase() as any,
                  decimalValue: parseInt(n, 16),
                })),
                octalGroups: comparisonData.octalGroups,
                groupedBinary: comparisonData.binaryGrouped,
              }}
              bitAnalysis={{
                bitCount: comparisonData.bitLength,
                onesCount: comparisonData.onesCount,
                zerosCount: comparisonData.zerosCount,
                isPowerOfTwo: comparisonData.isPowerOfTwo,
              }}
            />
          )}

          {/* Position Value Visualizer */}
          {showPositionValues && positionValueData && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && !useUnifiedAnimator && (
            <PositionValueVisualizer
              positionData={positionValueData}
              fromSystem={fromSystem as 'binary' | 'octal' | 'hexadecimal'}
            />
          )}

          {/* Bit Grouping Visualizer */}
          {showBitGrouping && binaryForGrouping && !useUnifiedAnimator && (
            <BitGroupingVisualizer
              binaryValue={binaryForGrouping}
              targetSystem="hexadecimal"
            />
          )}

          {/* Unified Animator */}
          {useUnifiedAnimator && (
            <>
              {showPositionValues && positionValueData && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && (
                <ConversionAnimator
                  conversionType="position-value"
                  steps={createPositionValueSteps(positionValueData, fromSystem as 'binary' | 'octal' | 'hexadecimal')}
                  initialSpeed={1}
                  showTimeline={true}
                  showSpeedControl={true}
                  enableKeyboardShortcuts={true}
                />
              )}

              {showBitGrouping && binaryForGrouping && (
                <ConversionAnimator
                  conversionType="bit-grouping"
                  steps={createBitGroupingSteps(binaryForGrouping, 'hexadecimal')}
                  initialSpeed={1}
                  showTimeline={true}
                  showSpeedControl={true}
                  enableKeyboardShortcuts={true}
                />
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
