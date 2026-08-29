/**
 * HexadecimalLearnModule - Main entry point for hexadecimal learn module
 */

import { HexadecimalLearnLayout } from './HexadecimalLearnLayout'

interface HexadecimalLearnModuleProps {
  onBackToHome: () => void
}

export function HexadecimalLearnModule({ onBackToHome }: HexadecimalLearnModuleProps) {
  return <HexadecimalLearnLayout onBackToHome={onBackToHome} />
}