export interface JumpRouteOptions {
  mainId?: string;
  headingsBySlug: ReadonlyMap<string, Array<{ label: string; element?: Element; index?: number }>>;
}

/**
 * Resolve the nearest in-page candidate offset for a hash-only jump before it becomes
 * a history location. In paper-craft routes the shell keeps a persistent main element and
 * the section anchors are section/scroll targets rather than URL paths.
 */
export function resolveHashJumpTarget(
  hash: string,
  options: JumpRouteOptions,
): { path: string; scrollTarget: Element | null; description: string } | null {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!cleaned || cleaned.includes('/')) return null;

  const target = document.getElementById(cleaned) ?? document.querySelector(`[id="${CSS.escape(cleaned)}"]`);
  if (target && typeof target.getBoundingClientRect === 'function') {
    return {
      path: cleaned.startsWith('main') ? '/' : `/${cleaned}`,
      scrollTarget: target,
      description: `Scroll to "${cleaned}" section`,
    };
  }

  // Fall back to nearest heading if the hashed label still matches a known slug.
  const candidates = options.headingsBySlug.get(cleaned);
  if (!candidates || candidates.length === 0) return null;
  const best = candidates[0].element ?? null;
  return {
    path: `/${cleaned}`,
    scrollTarget: best,
    description: `Scroll to "${cleaned}" heading`,
  };
}

export function readablePageTitle(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' — ').trim() || '';
}
