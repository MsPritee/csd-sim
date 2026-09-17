import { useState, useEffect } from 'react'
import type { CellValue } from '../../../core/kmap'
import PrimaryToolbar from './PrimaryToolbar'
import SecondaryToolbar from './SecondaryToolbar'
import ButtonGroup from './ButtonGroup'
// import FiveVarAxisControls from './FiveVarAxisControls' // LAYOUT FEATURE DISABLED (plane var + row/col swap)
import VariableNameEditor from './VariableNameEditor'

interface KMapToolbarProps {
  variableCount: 2 | 3 | 4 | 5
  currentValue: CellValue
  showMintermNumbers: boolean
  onVariableCountChange: (count: 2 | 3 | 4 | 5) => void
  onCurrentValueChange: (value: CellValue) => void
  onToggleMintermNumbers: () => void
  onClear: () => void
  // showAxisLayout?: boolean // LAYOUT FEATURE DISABLED
  variables?: readonly string[]
  onVariablesChange?: (names: string[]) => void
  // planeVar?: string // LAYOUT FEATURE DISABLED
  // onPlaneVarChange?: (v: string) => void // LAYOUT FEATURE DISABLED
  // swapAxes?: boolean // LAYOUT FEATURE DISABLED
  // onSwapAxesChange?: (swapped: boolean) => void // LAYOUT FEATURE DISABLED
}

export default function KMapToolbar({
  variableCount,
  currentValue,
  showMintermNumbers,
  onVariableCountChange,
  onCurrentValueChange,
  onToggleMintermNumbers,
  onClear,
  // showAxisLayout = false, // LAYOUT FEATURE DISABLED
  variables = [],
  onVariablesChange,
  // planeVar = 'E', // LAYOUT FEATURE DISABLED
  // onPlaneVarChange, // LAYOUT FEATURE DISABLED
  // swapAxes = false, // LAYOUT FEATURE DISABLED
  // onSwapAxesChange, // LAYOUT FEATURE DISABLED
}: KMapToolbarProps) {
  const [showSecondary, setShowSecondary] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="toolbar-primary kmap-toolbar rounded-lg p-1 sm:p-1.5 md:p-2 mb-1 sm:mb-1.5">
      <div className="flex flex-wrap gap-control-group items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-control-group items-center">
            <PrimaryToolbar
              variableCount={variableCount}
              currentValue={currentValue}
              onVariableCountChange={onVariableCountChange}
              onCurrentValueChange={onCurrentValueChange}
            />

            {/*
              LAYOUT FEATURE DISABLED — 5-variable plane/row-col layout picker.
              {showAxisLayout && (
                <FiveVarAxisControls
                  variables={variables}
                  planeVar={planeVar}
                  onPlaneVarChange={onPlaneVarChange ?? (() => {})}
                  swapAxes={swapAxes}
                  onSwapAxesChange={onSwapAxesChange ?? (() => {})}
                />
              )}
            */}
          </div>
        </div>

        <VariableNameEditor variables={variables} onChange={onVariablesChange} />

        <ButtonGroup>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="hidden sm:flex px-2 py-1 rounded text-xs transition-all touch-action-manipulation toolbar-control min-h-[40px]"
            style={{
              backgroundColor: showSecondary ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: showSecondary ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: showSecondary ? 'var(--shadow-accent)' : 'var(--shadow-xs)'
            }}
            title="Toggle display options"
          >
            {showSecondary ? '− Options' : '+ Options'}
          </button>

          <button
            onClick={onClear}
            className="rounded transition-all touch-action-manipulation"
            style={{ 
              backgroundColor: 'var(--error-border, #dc2626)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-error)',
              padding: '6px 12px',
              fontSize: '14px',
              minWidth: '44px',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-text, #b91c1c)'
              e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--error-border) 50%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-border, #dc2626)'
              e.currentTarget.style.boxShadow = 'var(--shadow-error)'
            }}
            title="Clear K-Map"
          >
            <span style={{ color: '#ffffff', display: 'inline' }}>Clear</span>
          </button>
        </ButtonGroup>
      </div>

      {(showSecondary || isMobile) && (
        <div className="mt-1.5 pt-1.5 border-t control-group" style={{ borderColor: 'var(--border-color)' }}>
          <SecondaryToolbar
            showMintermNumbers={showMintermNumbers}
            onToggleMintermNumbers={onToggleMintermNumbers}
          />
        </div>
      )}
    </div>
  )
}