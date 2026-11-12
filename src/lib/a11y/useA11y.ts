import { useContext } from 'react'
import { A11yContext } from './context'

export function useA11y() {
  const value = useContext(A11yContext)
  if (!value) throw new Error('useA11y must be used inside A11yProvider')
  return value
}
