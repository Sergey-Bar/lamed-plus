import type { IconName } from './Icon'

export const CATEGORY_ICONS: Record<string, IconName> = {
  B: 'car',
  A: 'motorcycle',
  A3: 'motorcycle',
  C1: 'truck',
  C: 'truck',
  BUS: 'bus',
  TRACTOR: 'tractor',
}

export function categoryIcon(id: string): IconName {
  return CATEGORY_ICONS[id] ?? 'car'
}