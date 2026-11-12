import type { CategoryConfig } from './schema'

const categoryModules = import.meta.glob<{ default: CategoryConfig }>(
  '/data/categories/*.json',
  { eager: true },
)

const rawCategories = Object.values(categoryModules).map((m) => m.default)

export const CATEGORIES: CategoryConfig[] = [...rawCategories].sort((a, b) =>
  a.id.localeCompare(b.id),
)

export const CATEGORY_MAP: Record<string, CategoryConfig> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)

export function getCategory(id: string): CategoryConfig | undefined {
  return CATEGORY_MAP[id]
}
