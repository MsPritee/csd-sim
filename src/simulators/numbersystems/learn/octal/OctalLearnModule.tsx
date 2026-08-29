/**
 * OctalLearnModule - Main entry point for octal learn module
 */

import { OctalLearnLayout } from './OctalLearnLayout'

interface OctalLearnModuleProps {
  onBackToHome: () => void
}

export function OctalLearnModule({ onBackToHome }: OctalLearnModuleProps) {
  return <OctalLearnLayout onBackToHome={onBackToHome} />
}