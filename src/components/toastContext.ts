import { createContext } from 'react'
import type { IconName } from './Icon'

export type ToastKind = 'success' | 'level' | 'achievement' | 'info'

export interface ToastItem {
  id: number
  kind: ToastKind
  icon: IconName
  title: string
  subtitle?: string
}

export interface ToastApi {
  show: (toast: Omit<ToastItem, 'id'>) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
