import browser from 'webextension-polyfill'
import { DEV } from '../lib/config.browser'

export type TabResponseInfo = {
  headers: Array<[string, string]>
  statusCode: number
  statusLine: string
}

interface StorageSchema {
  responseCache?: Record<string, TabResponseInfo>
  responseCache_lru?: { [tabId: string]: number }
}

const parseStorageSchema_dev = DEV
  ? (raw: any): StorageSchema => {
      if (raw) {
        const rawStorage = raw['responseCache']
        const rawLru = raw['responseCache_lru']
        if (typeof rawStorage === 'object' && typeof rawLru === 'object') {
          // TODO validate
          return raw
        }
      }

      return { responseCache: {}, responseCache_lru: {} }
    }
  : (raw: any) => raw as StorageSchema

class Mutex {
  private _queue: Promise<void> = Promise.resolve()

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this._queue.then(task)
    this._queue = result.then(
      () => {},
      () => {},
    )
    return result
  }
}

const lock = new Mutex()

/**
 * Retrieves headers for a specific tab and promotes it to "Most Recently Used".
 * Returns null if the tabId is not in the cache.
 */
export async function getResponseInfoFromCache(
  tabId: number,
): Promise<TabResponseInfo | null> {
  return lock.run(async () => {
    const data = parseStorageSchema_dev(
      await browser.storage.session.get(['responseCache', 'responseCache_lru']),
    )

    const raw = data['responseCache']

    const responseInfo = raw && raw[tabId]

    if (!responseInfo) return null

    // UPDATE LRU: Add/update timestamp for tabId
    const responseCache_lru = data.responseCache_lru || {}

    const now = +new Date()
    responseCache_lru[tabId] = now

    // Save only the LRU order (Data is unchanged)
    await browser.storage.session.set({ responseCache_lru })

    return responseInfo
  })
}

/**
 * Saves headers for a specific tab.
 * If the cache exceeds 10 items, the Least Recently Used tab is evicted.
 */
export const addResponseInfoToCache = async (
  tabId: number,
  responseInfo: TabResponseInfo,
): Promise<void> =>
  lock.run(async () => {
    const data = parseStorageSchema_dev(
      await browser.storage.session.get(['responseCache', 'responseCache_lru']),
    )

    const responseCache = data.responseCache || {}
    let responseCache_lru = data.responseCache_lru || {}

    // write Data
    responseCache[tabId] = responseInfo

    // save both Data and Order
    await browser.storage.session.set({
      responseCache,
      responseCache_lru,
    })
  })

/**
 * Helper to view the current LRU order and size (for debugging).
 */
export const getCacheDebugInfo = async () => {
  const data = parseStorageSchema_dev(
    await browser.storage.session.get(['responseCache_lru']),
  )

  return {
    size: (data.responseCache_lru || []).length,
    lruOrder: data.responseCache_lru || {},
  }
}
const MAX_AGE = 5 * 60_000

// clean out cache periodically
setInterval(async () => {
  const data = parseStorageSchema_dev(
    await browser.storage.session.get(['responseCache', 'responseCache_lru']),
  )

  const responseCache = data.responseCache || {}
  let responseCache_lru = data.responseCache_lru || {}

  const tabIds = Object.keys(responseCache_lru)
  const count = tabIds.length
  if (!count) return

  const latestAllowed = +new Date() - MAX_AGE

  for (let i = 0; i < count; i++) {
    const tabId = tabIds[i]!
    const time = responseCache_lru[tabId]!
    if (time < latestAllowed) {
      delete responseCache[tabId]
      delete responseCache_lru[tabId]
    }
  }
}, 5 * 60_000)
