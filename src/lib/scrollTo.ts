export function scrollToId(id: string, options: { focus?: boolean } = {}): boolean {
  const target = document.getElementById(id)
  if (!target) return false

  const prefersReducedMotion =
    document.documentElement.dataset['a11yMotion'] === 'reduce' ||
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const instant = prefersReducedMotion || document.visibilityState === 'hidden'
  target.scrollIntoView({
    behavior: instant ? 'instant' : 'smooth',
    block: 'start',
  })

  if (options.focus) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  return true
}
