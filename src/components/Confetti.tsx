import { useMemo } from 'react'

const COLORS = ['#58cc02', '#1cb0f6', '#ffc800', '#ce82ff', '#ff4b4b']

interface ConfettiProps {
  burst: boolean
  count?: number
}

export function Confetti({ burst, count = 42 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 1.1 + Math.random() * 1.2,
        size: 6 + Math.random() * 9,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    // regenerate a fresh burst each time it is triggered
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, count],
  )

  if (!burst) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 block rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
