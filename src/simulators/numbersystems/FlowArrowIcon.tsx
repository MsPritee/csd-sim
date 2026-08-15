/**
 * FlowArrowIcon - SVG icon for animated flow arrows between rows
 * Shows the direction of information flow with subtle animation
 */

interface FlowArrowIconProps {
  readonly size?: number
  readonly color?: string
  readonly animated?: boolean
  readonly direction?: 'down' | 'up'
}

export function FlowArrowIcon({
  size = 24,
  color = 'var(--text-secondary)',
  animated = true,
  direction = 'down',
}: FlowArrowIconProps) {
  const rotation = direction === 'down' ? 0 : 180

  return (
    <div 
      className="flex justify-center"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color }}
        className={animated ? 'animate-flow-dash' : ''}
      >
        <path
          d="M12 4V20M12 20L8 16M12 20L16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animated ? "4 4" : "0"}
        />
      </svg>
    </div>
  )
}
