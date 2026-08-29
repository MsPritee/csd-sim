/**
 * DecimalLearnModule - Main entry point for decimal learn module
 */

import { DecimalLearnLayout } from './DecimalLearnLayout'

interface DecimalLearnModuleProps {
  onBackToHome: () => void
}

export function DecimalLearnModule({ onBackToHome }: DecimalLearnModuleProps) {
  return <DecimalLearnLayout onBackToHome={onBackToHome} />
}
