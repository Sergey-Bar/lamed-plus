import type { IDBPDatabase } from 'idb'
import { openDatabase } from './db'
import { STORES } from './db'
import type { StoreName } from './db'

let dbPromise: Promise<IDBPDatabase> | null = null

export function ensureDb(): Promise<IDBPDatabase> {
  if (!dbPromise) dbPromise = openDatabase()
  return dbPromise
}

export interface DataRecord {
  id: string
  [key: string]: unknown
}

export async function get<T = unknown>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await ensureDb()
  return db.get(store, key) as Promise<T | undefined>
}

export async function put<T extends { id: string }>(
  store: StoreName,
  value: T,
): Promise<void> {
  const db = await ensureDb()
  await db.put(store, value)
}

export async function remove(store: StoreName, key: string): Promise<void> {
  const db = await ensureDb()
  await db.delete(store, key)
}

export async function append(
  store: StoreName,
  value: Record<string, unknown>,
): Promise<void> {
  const db = await ensureDb()
  if (store === HISTORY_STORE) {
    await db.add(HISTORY_STORE, value)
  } else {
    await db.put(store, value as DataRecord)
  }
}

export async function all<T = DataRecord>(store: StoreName): Promise<T[]> {
  const db = await ensureDb()
  return db.getAll(store) as Promise<T[]>
}

const HISTORY_STORE = 'history'

/**
 * Keep the answer log bounded. The log grows with every answer and is scanned
 * to build the readiness report, so an unbounded store eventually slows the
 * dashboard down. Oldest entries are dropped first.
 */
export async function trimHistory(keep: number): Promise<void> {
  const db = await ensureDb()
  const count = await db.count(HISTORY_STORE)
  if (count <= keep) return
  let remaining = count - keep
  const tx = db.transaction(HISTORY_STORE, 'readwrite')
  let cursor = await tx.objectStore(HISTORY_STORE).openCursor()
  while (cursor && remaining > 0) {
    await cursor.delete()
    remaining -= 1
    cursor = await cursor.continue()
  }
  await tx.done
}

export async function clear(store: StoreName): Promise<void> {
  const db = await ensureDb()
  await db.clear(store)
}

export async function clearAll(): Promise<void> {
  const db = await ensureDb()
  const tx = db.transaction(STORES, 'readwrite')
  for (const store of STORES) {
    tx.objectStore(store).clear()
  }
  await tx.done
}

/**
 * Replace every store with a previously exported snapshot. This is the only
 * way progress moves between devices without an account.
 */
export async function restoreAll(data: Record<string, unknown>): Promise<void> {
  const db = await ensureDb()
  const tx = db.transaction(STORES, 'readwrite')
  for (const store of STORES) {
    const target = tx.objectStore(store)
    await target.clear()
    const rows = Array.isArray(data[store]) ? (data[store] as Record<string, unknown>[]) : []
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue
      if (store === HISTORY_STORE) await target.add(row)
      else await target.put(row as DataRecord)
    }
  }
  await tx.done
}

export async function dumpAll(): Promise<Record<string, unknown[]>> {
  const db = await ensureDb()
  const result: Record<string, unknown[]> = {}
  for (const store of STORES) {
    result[store] = await db.getAll(store)
  }
  return result
}
