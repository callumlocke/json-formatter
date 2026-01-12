/*
  Enhances the devtools console on JSON pages.

  This script runs in world "MAIN" which means it can define window.* globals that you can use in the browser console.
  But it also restricts its security, including:
  - No runtime messaging (not sure about other kinds)

  Messaging hack used here is to parse dataset properties that were set on the DOM by the main content script.
*/

import { DEV } from '../lib/config.browser'
import { whenDomLoaded } from './lib/whenDomLoaded'
import type { TabResponseInfo } from '../worker/tabResponseCache'

//
;(async () => {
  // Wait for DOM to be ready
  await whenDomLoaded()

  // Wait a little longer for other stuff to settle (this is low priority)
  setTimeout(async () => {
    const pre = document
      .getElementById('jsonFormatterRaw')
      ?.querySelector('pre')

    // Exit now if it has not been formatted as a JSON page
    if (!pre) return

    try {
      // Parse it
      const data = JSON.parse(pre.innerText)

      // Export json global
      Object.defineProperty(window, 'json', {
        value: data,
        configurable: true,
        enumerable: false,
        writable: false,
      })

      if (DEV) {
        const duration = pre.dataset.duration
        const responseInfo = JSON.parse(
          pre.dataset.responseInfo ?? 'null',
        ) as TabResponseInfo | void
        // const preferences = JSON.parse(pre.dataset.preferences ?? 'null')

        if (responseInfo) {
          const contentTypeHeader =
            responseInfo.headers?.find(
              ([name]) => name.toLowerCase() === 'content-type',
            ) ?? null

          if (contentTypeHeader) {
            console.log(
              `%c${contentTypeHeader[0]}: %c${contentTypeHeader[1]}%c`,
              'color: lch(60% 42% 134deg);',
              'font-weight: bold; color: lch(60% 42% 134deg);',
              'color: lch(60% 42% 134deg);',
            )
          }
        }

        console.log(
          `%cType%c json %cto inspect`,
          'color: lch(60% 42% 134deg);',
          'font-weight: bold;',
          'color: lch(60% 42% 134deg);',
        )

        // console.log('Preferences', preferences)
      }
    } catch (error) {
      if (DEV)
        console.error(`JSON Formatter: Failed to create JSON global`, error)
    }
  }, 200)
})()
