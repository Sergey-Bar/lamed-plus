import { afterEach, describe, expect, it } from 'vitest'
import { formatBytes, readStorageStatus, requestPersistence } from './persist'

function stubStorage(value: unknown) {
  Object.defineProperty(navigator, 'storage', { value, configurable: true })
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'storage')
})

describe('storage status', () => {
  it('is unsupported when the browser has no StorageManager', async () => {
    stubStorage(undefined)
    const status = await readStorageStatus()
    expect(status.supported).toBe(false)
    expect(status.persisted).toBe(false)
    expect(await requestPersistence()).toBe(false)
  })

  it('reports persisted storage and the quota estimate', async () => {
    stubStorage({
      persisted: async () => true,
      estimate: async () => ({ usage: 1024, quota: 4096 }),
    })
    const status = await readStorageStatus()
    expect(status).toEqual({ supported: true, persisted: true, usage: 1024, quota: 4096 })
  })

  it('survives a rejected estimate', async () => {
    stubStorage({
      persisted: async () => false,
      estimate: async () => {
        throw new Error('denied')
      },
    })
    const status = await readStorageStatus()
    expect(status).toEqual({ supported: true, persisted: false, usage: null, quota: null })
  })

  it('never claims persistence it did not get', async () => {
    stubStorage({ persisted: async () => false, persist: async () => false })
    expect(await requestPersistence()).toBe(false)
    stubStorage({ persisted: async () => true, persist: async () => true })
    expect(await requestPersistence()).toBe(true)
  })
})

describe('formatBytes', () => {
  it('uses readable units', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatBytes(1234567890)).toBe('1.1 GB')
  })
})
