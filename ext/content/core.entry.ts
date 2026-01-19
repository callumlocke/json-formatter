import invariant from 'tiny-invariant'
import browser from 'webextension-polyfill'
import { buildDom } from './lib/buildDom'
import { getDocInfo } from './lib/getDocumentInfo'
import type { JsonValue } from '../../lib/types'
import { logGlobal, logLocal } from '../lib/logging/logging'
import { whenDomLoaded } from './lib/whenDomLoaded'
import { sendMessage } from '../lib/messaging/messaging'
import type { MessageProtocol } from '../lib/messaging/protocol'
import { prefStore } from '../lib/preferences/preferences'
// @ts-expect-error
import css from './style.css' with { type: 'text' }
// @ts-expect-error
import darkThemeCss from './styleDark.css' with { type: 'text' }
import { MAX_LENGTH } from '../lib/config.browser'

const initialPrefsPromise = prefStore.get()

const cssPromise = new Promise<string>(async (resolve) => {
  try {
    const prefs = await initialPrefsPromise

    switch (prefs.themeOverride) {
      case 'force_light':
        resolve(css)
        return
      case 'force_dark':
        resolve(`${css}\n\n${darkThemeCss}`)
        return
      default:
    }
  } catch (error) {
    logGlobal('ERROR', error)
  }

  resolve(`${css}\n\n@media (prefers-color-scheme: dark) {\n${darkThemeCss}\n}`)
})

const renderPromise = (async (): Promise<
  | {
      rendered: true
      responseInfoPromise: Promise<
        MessageProtocol['JF_GET_RESPONSE_INFO']['response']
      >
    }
  | { rendered: false }
> => {
  // Script generally runs before DOMContentLoaded but when body is already loaded enough for us to start.
  // But on rare occasions it seems to load before document.body.children can be reached, so check for that and wait for the whole DOM if it's not set
  if (!document.body?.children?.length) await whenDomLoaded()

  const info = getDocInfo()

  // Exit fast if it's clearly not a JSON page
  const { isTextPage, docHint } = info
  {
    const maybeJson =
      isTextPage &&
      docHint &&
      (docHint === 'JSON' || docHint === 'EMPTY' || docHint === 'OTHER')

    if (!maybeJson) return { rendered: false }
  }

  const { pre: originalPreElement, bodyChildren, chromeJfc } = info

  // @ts-expect-error
  window.__jf_pre = originalPreElement

  // Clear DOM before parsing (before it renders, to prevent FOUC)
  const body = document.body

  // Remove all children from body (pre, chromeJfc, any others)
  for (const child of bodyChildren) body.removeChild(child)

  // Request headers
  const responseInfoPromise = sendMessage('JF_GET_RESPONSE_INFO', {})

  // Try to parse it with JSON.parse
  const parseResult: { parsed: JsonValue } | false = (() => {
    const rawPreContent = originalPreElement.textContent
    const rawLength = rawPreContent.length

    // If there's a good chance it's some other non-JSON text type,
    // do some fast-fail checks before attempting JSON.parse to avoid garbage if it's not JSON
    if (docHint !== 'JSON' && !chromeJfc) {
      // Handle case: empty
      if (!rawPreContent) return false // No content in body > pre'

      if (rawLength > MAX_LENGTH) return false // Too long

      // Find first significant character and reject if
      const [startChar] = rawPreContent.match(/[^\x20\x0a\x0d\x09]/) ?? []
      if (startChar !== '{' && startChar !== '[') return false
    }

    // Status: probably JSON, and acceptable length.
    // Try to parse as JSON
    try {
      const _parsed = JSON.parse(rawPreContent)

      if (!(typeof _parsed === 'object' && _parsed != null)) return false
      // { note: 'Technically JSON but not an object or array', rawLength }

      // IT IS VALID JSON. We can render it.
      return { parsed: _parsed }
    } catch (error) {
      logGlobal('JSON parse failed', { error, pageInfo: info })

      return false // Does not parse as JSON', rawLength
    }
  })()

  if (!parseResult) {
    // STATUS: It's definitely a text page (not HTML, has a PRE etc), and indications are it is or could be intended as JSON, but the pre contents did not parse as JSON.

    // LATER: show an error report.
    // FOR NOW: restore DOM and cancel rendering
    for (let i = 0, l = bodyChildren.length; i < l; i++) {
      const el = bodyChildren[i]!
      body.appendChild(el)
    }

    return { rendered: false }
  }

  // RENDER!
  {
    const parsed = parseResult.parsed

    // Add inner containers
    const parsedJsonContainer = document.createElement('div')
    parsedJsonContainer.id = 'jsonFormatterParsed'
    document.body.appendChild(parsedJsonContainer)

    const rawJsonContainer = document.createElement('div')
    rawJsonContainer.hidden = true
    rawJsonContainer.id = 'jsonFormatterRaw'
    rawJsonContainer.append(originalPreElement)
    document.body.appendChild(rawJsonContainer)

    // Status: it is a valid JSON object or array, and we have parsed the whole thing.
    // Flesh out the UI and handle events
    {
      // Insert CSS
      const jfStyleEl = document.createElement('style')
      jfStyleEl.id = 'jfStyleEl'
      //jfStyleEl.innerText = 'body{padding:0;}' ;
      jfStyleEl.insertAdjacentHTML('beforeend', await cssPromise)
      document.head.appendChild(jfStyleEl)

      document.head.insertAdjacentHTML(
        'afterbegin',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      )

      // Create toggle buttons
      const optionBar = document.createElement('div')
      optionBar.id = 'optionBar'

      const buttonPlain = document.createElement('button')
      const buttonPlainSpan = document.createElement('span')
      const buttonFormatted = document.createElement('button')
      const buttonFormattedSpan = document.createElement('span')
      buttonPlain.appendChild(buttonPlainSpan)
      buttonFormatted.appendChild(buttonFormattedSpan)

      buttonPlain.id = 'buttonPlain'
      buttonPlainSpan.innerText = 'Raw'
      buttonFormatted.id = 'buttonFormatted'
      buttonFormattedSpan.innerText = 'Parsed'
      buttonFormatted.classList.add('selected')

      // Handle toggle button events
      let plainOn = false
      buttonPlain.addEventListener(
        'mousedown',
        () => {
          if (!plainOn) {
            plainOn = true
            rawJsonContainer.hidden = false
            parsedJsonContainer.hidden = true

            buttonFormatted.classList.remove('selected')
            buttonPlain.classList.add('selected')
          }
        },
        false,
      )

      buttonFormatted.addEventListener(
        'mousedown',
        function () {
          if (plainOn) {
            plainOn = false
            rawJsonContainer.hidden = true
            parsedJsonContainer.hidden = false

            buttonFormatted.classList.add('selected')
            buttonPlain.classList.remove('selected')
          }
        },
        false,
      )

      optionBar.appendChild(buttonPlain)
      optionBar.appendChild(buttonFormatted)

      document.body.prepend(optionBar)

      // Attach document-wide listener
      document.addEventListener('mousedown', generalClick)
    }

    // Do formatting and finalise DOM
    const rootEntry = buildDom(parsed, false)
    await Promise.resolve()
    parsedJsonContainer.append(rootEntry)
    return { rendered: true, responseInfoPromise }
  }

  function collapse(elements: HTMLElement[] | HTMLCollection) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i]!
      el.classList.add('collapsed') // hides contents and shows an ellipsis
    }
  }

  function expand(elements: HTMLElement[] | HTMLCollection) {
    for (let i = elements.length - 1; i >= 0; i--)
      elements[i]!.classList.remove('collapsed')
  }

  function generalClick(ev: MouseEvent) {
    const elem = ev.target
    if (!(elem instanceof HTMLElement)) return

    if (elem.className === 'e') {
      // It's a click on an expander.

      ev.preventDefault()

      const parent = elem.parentNode
      invariant(parent instanceof HTMLElement)

      // Expand or collapse
      if (parent.classList.contains('collapsed')) {
        // EXPAND
        if (ev.metaKey || ev.ctrlKey) {
          const gp = parent.parentNode
          invariant(gp instanceof HTMLElement)
          expand(gp.children)
        } else expand([parent])
      } else {
        // COLLAPSE
        if (ev.metaKey || ev.ctrlKey) {
          const gp = parent.parentNode
          invariant(gp instanceof HTMLElement)
          collapse(gp.children)
        } else collapse([parent])
      }
    }
  }
})()

renderPromise.then(async (result) => {
  if (PERFMARKS) performance.mark('DONE')

  if (result.rendered) {
    if (PERFMARKS)
      logGlobal('MARKS', performance.getEntriesByName('PERF_RENDER_DURATION'))

    // @ts-expect-error
    const pre = window.__jf_pre as HTMLPreElement | void
    if (pre) {
      const responseInfoResult = await result.responseInfoPromise

      if (PERFMARKS) {
        const PERF_RENDERING = performance.measure(
          'PERF_RENDERING',
          'SCRIPT_PARSE_START',
          'DONE',
        )
        pre.dataset.duration = `${PERF_RENDERING.duration}`

        await browser.storage.local.set({
          perf_lastRenderSpeed: PERF_RENDERING.duration,
          perf_lastRenderTime: +new Date(),
        })
      }

      // does console script need preferences?
      // pre.dataset.preferences = JSON.stringify(await prefStore.get())

      if (responseInfoResult.success)
        pre.dataset.responseInfo = JSON.stringify(
          responseInfoResult.responseInfo,
        )
    } else logLocal(`⚠️ Unexpeced - could not find window.__jf_pre`)
  }
})
