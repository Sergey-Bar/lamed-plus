import { beforeEach, describe, expect, it } from 'vitest'
import { all, append, clear, clearAll, dumpAll, get, put, remove } from './store'

describe('IndexedDB progress store', () => {
  beforeEach(async () => {
    await clearAll()
  })

  describe('put and get', () => {
    it('round-trips a record', async () => {
      await put('prefs', { id: 'language', value: 'he' })
      const stored = await get<{ id: string; value: string }>('prefs', 'language')
      expect(stored?.value).toBe('he')
    })

    it('overwrites existing record with same key', async () => {
      await put('prefs', { id: 'language', value: 'he' })
      await put('prefs', { id: 'language', value: 'en' })
      const stored = await get<{ id: string; value: string }>('prefs', 'language')
      expect(stored?.value).toBe('en')
    })

    it('returns undefined for missing key', async () => {
      const stored = await get('prefs', 'nonexistent')
      expect(stored).toBeUndefined()
    })

    it('handles complex objects', async () => {
      const obj = { id: 'complex', nested: { a: 1, b: [1, 2, 3] }, date: new Date().toISOString() }
      await put('prefs', obj)
      const stored = await get('prefs', 'complex')
      expect(stored).toEqual(obj)
    })
  })

  describe('remove', () => {
    it('deletes a record by key', async () => {
      await put('prefs', { id: 'language', value: 'en' })
      await remove('prefs', 'language')
      await expect(get('prefs', 'language')).resolves.toBeUndefined()
    })

    it('does not throw for missing key', async () => {
      await expect(remove('prefs', 'nonexistent')).resolves.toBeUndefined()
    })
  })

  describe('all', () => {
    it('lists all records in a store', async () => {
      await put('mastery', { id: 'B:signs', correct: 5, answered: 8 })
      await put('mastery', { id: 'B:speed', correct: 2, answered: 3 })
      const rows = await all<{ id: string }>('mastery')
      expect(rows.map((r) => r.id).sort()).toEqual(['B:signs', 'B:speed'])
    })

    it('returns empty array for empty store', async () => {
      const rows = await all('mastery')
      expect(rows).toEqual([])
    })
  })

  describe('append', () => {
    it('appends to history store', async () => {
      await append('history', { category: 'B', topicId: 'signs', questionId: 'q1', correct: true, mode: 'study', ts: 1000 })
      await append('history', { category: 'B', topicId: 'speed', questionId: 'q2', correct: false, mode: 'practice', ts: 2000 })
      const rows = await all('history')
      expect(rows).toHaveLength(2)
    })

    it('puts to non-history stores', async () => {
      await append('prefs', { id: 'test', value: 'appended' })
      const stored = await get<{ id: string; value: string }>('prefs', 'test')
      expect(stored?.value).toBe('appended')
    })
  })

  describe('clear', () => {
    it('clears a single store', async () => {
      await put('prefs', { id: 'a', value: 1 })
      await put('prefs', { id: 'b', value: 2 })
      await clear('prefs')
      expect(await all('prefs')).toHaveLength(0)
    })

    it('does not affect other stores', async () => {
      await put('prefs', { id: 'a', value: 1 })
      await put('mastery', { id: 'B:signs', correct: 1, answered: 1 })
      await clear('prefs')
      expect(await all('mastery')).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('clears all stores', async () => {
      await put('prefs', { id: 'language', value: 'ru' })
      await put('inventory', { id: 'inventory', energy: 0, lives: 5, lastLivesTs: 0, shield: 0, used: {} })
      await put('mastery', { id: 'B:signs', correct: 1, answered: 1 })
      await put('srs', { id: 'q1', intervalDays: 1, dueTs: 0, lapses: 0, lastSeenTs: 0 })
      await put('achievements', { id: 'achievements', unlocked: [] })
      await append('history', { category: 'B', topicId: 'signs', questionId: 'q1', correct: true, mode: 'study', ts: 1000 })
      await clearAll()
      expect(await all('prefs')).toHaveLength(0)
      expect(await all('inventory')).toHaveLength(0)
      expect(await all('mastery')).toHaveLength(0)
      expect(await all('srs')).toHaveLength(0)
      expect(await all('achievements')).toHaveLength(0)
      expect(await all('history')).toHaveLength(0)
    })
  })

  describe('dumpAll', () => {
    it('dumps all stores', async () => {
      await put('prefs', { id: 'language', value: 'ru' })
      await put('inventory', { id: 'inventory', energy: 0, lives: 5, lastLivesTs: 0, shield: 0, used: {} })
      const dump = await dumpAll()
      expect(dump['prefs']).toHaveLength(1)
      expect(dump['inventory']).toHaveLength(1)
      expect(Object.keys(dump)).toContain('prefs')
      expect(Object.keys(dump)).toContain('inventory')
      expect(Object.keys(dump)).toContain('mastery')
      expect(Object.keys(dump)).toContain('srs')
      expect(Object.keys(dump)).toContain('achievements')
      expect(Object.keys(dump)).toContain('history')
    })
  })

  describe('transaction isolation', () => {
    it('maintains data integrity across operations', async () => {
      await put('prefs', { id: 'a', value: 1 })
      await put('prefs', { id: 'b', value: 2 })
      await remove('prefs', 'a')
      const allRecords = await all('prefs')
      expect(allRecords).toHaveLength(1)
      expect(allRecords[0].id).toBe('b')
    })
  })
})
