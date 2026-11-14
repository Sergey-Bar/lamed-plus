import { getCloud } from './client'
import { mergeSnapshots } from './merge'
import type { Snapshot } from './snapshot'

type SyncOutcome = { ok: true; snapshot: Snapshot } | { ok: false; error: string }

async function fetchRemote(userId: string): Promise<Snapshot | null> {
  const cloud = getCloud()
  if (!cloud) throw new Error('cloud-disabled')
  const { data, error } = await cloud
    .from('progress')
    .select('snapshot')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.snapshot as Snapshot | undefined) ?? null
}

export async function pushRemote(userId: string, snapshot: Snapshot): Promise<void> {
  const cloud = getCloud()
  if (!cloud) throw new Error('cloud-disabled')
  const { error } = await cloud.from('progress').upsert({
    user_id: userId,
    snapshot,
    updated_at: new Date(snapshot.updatedAt).toISOString(),
  })
  if (error) throw new Error(error.message)
}

/** Merges what this device has with what the account has, then stores the result. */
export async function syncSnapshot(local: Snapshot, userId: string): Promise<SyncOutcome> {
  try {
    const remote = await fetchRemote(userId)
    if (!remote) {
      await pushRemote(userId, local)
      return { ok: true, snapshot: local }
    }
    const merged = mergeSnapshots(local, remote)
    const changed = JSON.stringify(merged) !== JSON.stringify(remote)
    if (changed) await pushRemote(userId, merged)
    return { ok: true, snapshot: merged }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'sync-failed' }
  }
}
