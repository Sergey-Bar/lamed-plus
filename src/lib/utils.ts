export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = String(totalSeconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}
