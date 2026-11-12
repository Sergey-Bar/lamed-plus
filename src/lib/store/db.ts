import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'

export const DB_NAME = 'theoria'
export const DB_VERSION = 1

export const STORES = [
  'prefs',
  'mastery',
  'srs',
  'xpLevel',
  'streaks',
  'achievements',
  'inventory',
  'history',
] as const

export type StoreName = (typeof STORES)[number]

export function openDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          if (name === 'history') {
            db.createObjectStore(name, { keyPath: 'id', autoIncrement: true })
          } else {
            db.createObjectStore(name, { keyPath: 'id' })
          }
        }
      }
    },
  })
}
