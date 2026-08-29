/**
 * BinaryLearnModule - Main entry point for binary learn module
 */

import { BinaryLearnLayout } from './BinaryLearnLayout'

interface BinaryLearnModuleProps {
  onBackToHome: () => void
}

export function BinaryLearnModule({ onBackToHome }: BinaryLearnModuleProps) {
  return <BinaryLearnLayout onBackToHome={onBackToHome} />
}