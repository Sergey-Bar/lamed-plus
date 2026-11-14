import { useContext } from 'react'
import { CloudContext, EMPTY_CLOUD } from './context'
import type { CloudApi } from './context'

export function useCloud(): CloudApi {
  return useContext(CloudContext) ?? EMPTY_CLOUD
}