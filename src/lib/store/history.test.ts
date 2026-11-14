import { beforeEach, describe, expect, it } from 'vitest'
import { all, append, clear, trimHistory } from './store'

describe('history retention', () => {
  beforeEach(async () => {
    await clear('history')
  })

  it('drops the oldest entries and keeps the newest ones', async () => {
    for (let seq = 0; seq < 12; seq += 1) {
      await append('history', { seq })
    }

    await trimHistory(5)

    const rows = await all<{ seq: number }>('history')
    expect(rows).toHaveLength(5)
    expect(rows.map((row) => row.seq)).toEqual([7, 8, 9, 10, 11])
  })

  it('leaves a short log untouched', async () => {
    await append('history', { seq: 0 })
    await trimHistory(5)
    expect(await all('history')).toHaveLength(1)
  })

  it('is a no-op when the store is already under the limit', async () => {
    await expect(trimHistory(5)).resolves.toBeUndefined()
  })
})
