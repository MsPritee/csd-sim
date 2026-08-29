import { useState, useEffect } from 'react'
// import { useIsMobile } from '../hooks/useBreakpoint'
// import Tooltip from './Tooltip'

interface FABProps {
  icon: string
  onClick: () => void
  tooltip?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  showOnMobile?: boolean
}

export default function FloatingActionButton({
  icon,
  onClick,
  tooltip: _tooltip,
  position = 'bottom-right',
  showOnMobile = true,
}: FABProps) {
  // const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // if (showOnMobile && isMobile) {
    //   setIsVisible(true)
    // } else if (!showOnMobile && !isMobile) {
    //   setIsVisible(true)
    // } else {
    //   setIsVisible(false)
    // }
    setIsVisible(showOnMobile)
  }, [showOnMobile])

  if (!isVisible) return null

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  const button = (
    <button
      onClick={onClick}
      className="fixed z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 touch-action-manipulation"
      style={{
        backgroundColor: 'var(--accent-primary)',
        color: '#ffffff',
      }}
    >
      {icon}
    </button>
  )

  // if (tooltip) {
  //   return (
  //     <div className={positionClasses[position]}>
  //       <Tooltip content={tooltip}>
  //         {button}
  //       </Tooltip>
  //     </div>
  //   )
  // }

  return <div className={positionClasses[position]}>{button}</div>
}
