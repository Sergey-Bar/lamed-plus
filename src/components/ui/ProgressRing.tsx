interface ProgressRingProps {
  value: number
  size?: number
  stroke?: number
  className?: string
  label?: string
  tone?: 'accent' | 'success' | 'danger' | 'info'
}

const TONES: Record<NonNullable<ProgressRingProps['tone']>, string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  info: 'var(--info)',
}

export function ProgressRing({
  value,
  size = 112,
  stroke = 9,
  className = '',
  label,
  tone = 'accent',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONES[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tnum font-display text-2xl font-extrabold leading-none text-ink">
          {Math.round(clamped)}
          <span className="text-sm font-bold text-muted">%</span>
        </span>
        {label && (
          <span className="mt-1 max-w-[82%] text-balance text-[10px] font-semibold leading-tight text-muted">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
