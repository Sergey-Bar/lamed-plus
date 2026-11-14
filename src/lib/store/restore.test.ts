import { beforeEach, describe, expect, it } from 'vitest'
import { append, all, clearAll, dumpAll, get, put, restoreAll } from './store'

describe('progress export and restore', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('restores every store from a snapshot', async () => {
    await put('prefs', { id: 'displayName', value: 'Dana' })
    await put('mastery', {
      id: 'B:laws',
      category: 'B',
      topicId: 'laws',
      correct: 3,
      answered: 4,
    })
    await append('history', { category: 'B', questionId: 'q1', correct: true, ts: 1 })
    await append('history', { category: 'B', questionId: 'q2', correct: false, ts: 2 })

    const snapshot = (await dumpAll()) as Record<string, unknown>
    await clearAll()
    expect(await get('prefs', 'displayName')).toBeUndefined()

    await restoreAll(snapshot)

    expect(await get<{ id: string; value: string }>('prefs', 'displayName')).toEqual({
      id: 'displayName',
      value: 'Dana',
    })
    const mastery = await all<{ correct: number }>('mastery')
    expect(mastery[0]?.correct).toBe(3)
    const history = await all<{ questionId: string }>('history')
    expect(history.map((row) => row.questionId).sort()).toEqual(['q1', 'q2'])
  })

  it('ignores malformed rows instead of failing the whole import', async () => {
    await restoreAll({ prefs: [{ id: 'x', value: 1 }, 'nonsense', null] })
    const prefs = await all('prefs')
    expect(prefs).toHaveLength(1)
  })

  it('clears stores missing from the snapshot', async () => {
    await put('prefs', { id: 'dailyGoal', value: 30 })
    await restoreAll({})
    expect(await get('prefs', 'dailyGoal')).toBeUndefined()
  })
})
