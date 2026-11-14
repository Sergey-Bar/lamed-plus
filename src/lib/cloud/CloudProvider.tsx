import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getCloud } from './client'
import { CLOUD_ENABLED } from './config'
import { CloudContext, EMPTY_CLOUD } from './context'
import type { CloudApi } from './context'
import { buildSnapshot, writeSnapshot } from './snapshot'
import { pushRemote, syncSnapshot } from './sync'
import { useProgress } from '../progress/ProgressProvider'
import { track } from '../analytics/track'

export function CloudProvider({ children }: { children: ReactNode }) {
  const progress = useProgress()
  const stateRef = useRef(progress)

  useEffect(() => {
    stateRef.current = progress
  }, [progress])

  const [session, setSession] = useState<Session | null>(null)
  const [busy, setBusy] = useState(false)
  const syncedOnce = useRef(false)

  useEffect(() => {
    const cloud = getCloud()
    if (!cloud) return
    let cancelled = false
    void cloud.auth.getSession().then(({ data }) => {
      if (!cancelled) setSession(data.session ?? null)
    })
    const { data } = cloud.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) syncedOnce.current = false
  }, [session])

  const sync = useCallback(async () => {
    const cloud = getCloud()
    const userId = session?.user.id
    if (!cloud || !userId) return { ok: false, error: 'signed-out' }
    setBusy(true)
    const local = buildSnapshot(stateRef.current)
    const result = await syncSnapshot(local, userId)
    setBusy(false)
    if (!result.ok) return { ok: false, error: result.error }
    syncedOnce.current = true
    if (JSON.stringify(result.snapshot) !== JSON.stringify(local)) {
      await writeSnapshot(result.snapshot)
      window.location.reload()
    }
    return { ok: true }
  }, [session])

  // After the first merge, keep the account up to date without blocking a tap.
  useEffect(() => {
    const userId = session?.user.id
    if (!userId || !syncedOnce.current) return
    const timer = setTimeout(() => {
      void pushRemote(userId, buildSnapshot(stateRef.current)).catch(() => {})
    }, 5000)
    return () => clearTimeout(timer)
  }, [session, progress.xp, progress.answeredCount, progress.onboarded])

  const signIn = useCallback(async (email: string) => {
    const cloud = getCloud()
    if (!cloud) return { ok: false, error: 'cloud-disabled' }
    const { error } = await cloud.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) return { ok: false, error: error.message }
    track('sign_in')
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    const cloud = getCloud()
    if (!cloud) return
    await cloud.auth.signOut()
    syncedOnce.current = false
    setSession(null)
  }, [])

  /**
   * The client cannot remove its own auth user, so a security-definer function
   * in the database does it (see supabase/schema.sql). Local progress stays.
   */
  const deleteAccount = useCallback(async () => {
    const cloud = getCloud()
    if (!cloud) return { ok: false, error: 'cloud-disabled' }
    const { error } = await cloud.rpc('delete_my_account')
    if (error) return { ok: false, error: error.message }
    await cloud.auth.signOut()
    syncedOnce.current = false
    setSession(null)
    return { ok: true }
  }, [])

  const value = useMemo<CloudApi>(
    () =>
      CLOUD_ENABLED
        ? {
            enabled: true,
            email: session?.user.email ?? null,
            busy,
            signIn,
            signOut,
            sync,
            deleteAccount,
          }
        : EMPTY_CLOUD,
    [session, busy, signIn, signOut, sync, deleteAccount],
  )

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>
}
