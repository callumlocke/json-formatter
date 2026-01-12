import browser from 'webextension-polyfill'
import { logLocal, logLocal_keepInProd } from '../logging/logging'
import { prefStore } from '../preferences/preferences'
import { DEV } from '../config.browser'

const migrate = async () => {
  // Migrate pre-v0.9 loose `themeOverride` setting to preferences
  try {
    const { themeOverride } = await browser.storage.local.get('themeOverride')

    switch (themeOverride) {
      case 'force_light':
      case 'force_dark':
      case 'system':
        await prefStore.set({ themeOverride })
        break
      default:
        if (themeOverride !== undefined)
          await browser.storage.local.remove('themeOverride')
    }
  } catch (error) {
    logLocal_keepInProd('Error migrating preferences', error)
  }
}

/**
 * Runs the idempotent `migrate` function once on install/update or on browser update. (Or on every startup in DEV mode.)
 */
export const migrateOnUpdate = async () => {
  // migrate old themeOverride value into prefs
  browser.runtime.onInstalled.addListener((info) => {
    logLocal(`runtime.onInstalled`, info)
    migrate()
  })

  // In DEV, migrate every startup
  if (DEV) await migrate()
}
