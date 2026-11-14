import { useContext } from 'react'
import { ProgressContext } from './context'
import type { ProgressApi } from './context'

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}