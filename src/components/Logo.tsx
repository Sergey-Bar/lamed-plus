import { Link } from 'react-router-dom'

interface LogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
  to?: string
}

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="LAMED+"
    >
      <rect width="64" height="64" rx="15" fill="#287C79" />
      <path
        d="M23 17v27c0 2.8 2.2 5 5 5h18"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M45.5 20v11"
        fill="none"
        stroke="#E8B64C"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="45.5" cy="38.5" r="3.4" fill="#E8B64C" />
      <path
        d="M23 40h13"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.42"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 5"
      />
    </svg>
  )
}

export function Logo({ size = 38, withWordmark = true, className = '', to = '/' }: LogoProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="LAMED+"
    >
      <span className="inline-flex shrink-0">
        <LogoMark size={size} className="rounded-[0.7rem]" />
      </span>
      {withWordmark && (
        <span className="flex items-baseline gap-0.5 text-[1.22rem] font-extrabold leading-none tracking-[-0.04em] text-ink">
          <span dir="ltr">LAMED</span>
          <span className="text-accent-2" aria-hidden="true">
            +
          </span>
        </span>
      )}
    </Link>
  )
}
