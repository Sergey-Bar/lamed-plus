import { useEffect } from 'react'
import { track } from './track'

/** One event per app launch, and only when measurement was explicitly allowed. */
export function AnalyticsBoot() {
  useEffect(() => {
    track('app_open')
  }, [])
  return null
}
