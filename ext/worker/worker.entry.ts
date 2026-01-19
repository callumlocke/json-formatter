import browser from 'webextension-polyfill'
import { DEV } from '../lib/config.browser'
import { logGlobal, logLocal } from '../lib/logging/logging'
import { onMessage } from '../lib/messaging/messaging'
import { migrateOnUpdate } from '../lib/migrations/migrations'
import { prefStore } from '../lib/preferences/preferences'
import {
  addResponseInfoToCache,
  getResponseInfoFromCache,
} from './tabResponseCache'

// 'global' logs mean logs to worker console from any extension context
onMessage('JF_GLOBAL_LOG', ({ message, payload }, sender) => {
  console.log(`Tab ${sender.tab?.id ?? '???'} log:`, {
    message,
    payload,
    sender,
  })
})

prefStore.onChange((change) => {
  logLocal(`🐙 Prefs changed`, change)
})

const reload = async () => {
  await browser.storage.local.set({ lastReload: +new Date() })
  browser.runtime.reload()
}

// Inject formatter into tabs with Content-Type: application/json
if (true) {
  onMessage('JF_GET_RESPONSE_INFO', async (_, sender) => {
    const tabId = sender.tab?.id

    if (typeof tabId !== 'number') {
      logGlobal('No tabId from GET_RESPONSE_HEADERS', { sender })
      return { success: false }
    }

    const responseInfo = await getResponseInfoFromCache(tabId)
    if (responseInfo) return { success: true, responseInfo }
    return { success: false }
  })

  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers: Array<[string, string]> = []

      for (const { name, value } of details.responseHeaders!) {
        if (!value) continue
        headers.push([name, value])
      }

      const { statusCode, statusLine } = details

      addResponseInfoToCache(details.tabId, { headers, statusLine, statusCode })

      return undefined
    },
    { urls: ['<all_urls>'], types: ['main_frame'] },
    ['responseHeaders'],
  )
}

//
;(async () => {
  // Check when extension was last reloaded
  {
    const { lastReload } = await browser.storage.local.get(['lastReload']) // TODO try single key
    const now = +new Date()
    if (typeof lastReload === 'number')
      logLocal(`Last known reload was ${now - lastReload} ms ago`)

    // In dev, monitor build service and reload when instructed
    if (DEV) {
      browser.action.onClicked.addListener(() => {
        logLocal('Manual reload via browser action click (in DEV)')
        reload()
      })

      const ws = new WebSocket('ws://localhost:8585')
      ws.addEventListener('open', (event) => {
        logLocal('🟢 ws://localhost:8585 open', event)
        browser.action.setBadgeText({ text: '🔗' })
        browser.action.setBadgeBackgroundColor({ color: '#01b100' })
      })
      ws.addEventListener('error', (error) => {
        logLocal('🔴 ws://localhost:8585 error', error)
        browser.action.setBadgeText({ text: '✖︎' })
        browser.action.setBadgeBackgroundColor({ color: '#c22' })
      })
      ws.addEventListener('close', (event) => {
        logLocal('⚪ ws://localhost:8585 closed', event)
        browser.action.setBadgeText({ text: '' })
        // browser.action.setBadgeBackgroundColor({})
      })

      ws.addEventListener('message', (event) => {
        if (event.data === 'reload_extension') {
          // debugger
          logLocal('Reloading extension...')
          reload()
        }
      })
    }
  }

  // Make extension action button open the options page
  if (!DEV) {
    browser.action.onClicked.addListener(() => {
      browser.runtime.openOptionsPage()
    })
  }

  // Keep track of the manifest version
  {
    const currentVersion = browser.runtime.getManifest().version
    const { version: previousVersion } =
      await browser.storage.local.get('version')

    if (previousVersion !== currentVersion) {
      console.log(
        `Version changed from ${JSON.stringify(previousVersion)} to ${JSON.stringify(currentVersion)}`,
      )
    }

    await browser.storage.local.set({ version: currentVersion })
  }

  // Prefs
  {
    // Export console helper for clearing preferences, for debugging
    // @ts-expect-error
    globalThis.prefStore = prefStore
  }

  // onInstalled (after updates), attempt to migrate misc localstorage values to current prefs

  await migrateOnUpdate()
})()
