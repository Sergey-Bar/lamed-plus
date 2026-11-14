import { createContext } from 'react'

export interface CloudApi {
  enabled: boolean
  email: string | null
  busy: boolean
  signIn: (email: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  sync: () => Promise<{ ok: boolean; error?: string }>
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>
}

export const CloudContext = createContext<CloudApi | null>(null)

export const EMPTY_CLOUD: CloudApi = {
  enabled: false,
  email: null,
  busy: false,
  signIn: async () => ({ ok: false, error: 'cloud-disabled' }),
  signOut: async () => {},
  sync: async () => ({ ok: false, error: 'cloud-disabled' }),
  deleteAccount: async () => ({ ok: false, error: 'cloud-disabled' }),
}