import React from 'react'

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export default function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}