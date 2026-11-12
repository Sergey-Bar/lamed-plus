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
  if (store === 'history') {
    await db.add('history', value)
  } else {
    await db.put(store, value as DataRecord)
  }
}

export async function all<T = DataRecord>(store: StoreName): Promise<T[]> {
  const db = await ensureDb()
  return db.getAll(store) as Promise<T[]>
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

export async function dumpAll(): Promise<Record<string, unknown[]>> {
  const db = await ensureDb()
  const result: Record<string, unknown[]> = {}
  for (const store of STORES) {
    result[store] = await db.getAll(store)
  }
  return result
}
