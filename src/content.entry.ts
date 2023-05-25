import './lib/beforeAll'

// @ts-ignore
import css from './style.css'
// @ts-ignore
import darkThemeCss from './styleDark.css'

import { buildDom } from './lib/buildDom'
import { JsonArray, JsonObject, JsonValue } from './lib/types'
import { assert } from './lib/assert'

const PERFORMANCE_DEBUGGING = false

const cssPromise = new Promise<string>((resolve) => {
  chrome.storage.local.get('themeOverride', (result) => {
    // console.log('value', result['themeOverride'])

    switch (result['themeOverride']) {
      case 'force_light':
        resolve(css)
        break
      case 'force_dark':
        resolve(css + '\n\n' + darkThemeCss)
        break

      case 'system':
      default:
        resolve(
          css +
            '\n\n@media (prefers-color-scheme: dark) {\n' +
            darkThemeCss +
            '\n}'
        )
    }
  })
})

const resultPromise = (async (): Promise<{
  formatted: boolean
  note: string
  rawLength: number | null
}> => {
  const originalPreElement = (() => {
    const bodyChildren = document.body.children
    const length = bodyChildren.length
    for (let i = 0; i < length; i++) {
      const child = bodyChildren[i]
      if (child.tagName === 'PRE') return child as HTMLPreElement
    }
    return null
  })()

  if (originalPreElement === null)
    return { formatted: false, note: 'No body>pre found', rawLength: null }

  const rawPreContent = originalPreElement.textContent

  if (!rawPreContent)
    return { formatted: false, note: 'No content in body>pre', rawLength: 0 }

  const rawLength = rawPreContent.length

  if (rawLength > 3000000)
    return {
      formatted: false,
      note: `Too long`,
      rawLength,
    }
  if (!/^\s*[\{\[]/.test(rawPreContent))
    return {
      formatted: false,
      note: `Does not start with { or ]`,
      rawLength,
    }

  // Status: probably JSON, and acceptable length.

  // Detach the pre
  originalPreElement.remove()

  // Add inner containers
  const parsedJsonContainer = document.createElement('div')
  parsedJsonContainer.id = 'jsonFormatterParsed'
  document.body.appendChild(parsedJsonContainer)

  const rawJsonContainer = document.createElement('div')
  rawJsonContainer.hidden = true
  rawJsonContainer.id = 'jsonFormatterRaw'
  rawJsonContainer.append(originalPreElement)
  document.body.appendChild(rawJsonContainer)

  // Try to parse as JSON
  {
    let parsedJsonValue: JsonValue
    try {
      parsedJsonValue = JSON.parse(rawPreContent)
    } catch (e) {
      // undo UI changes and return
      parsedJsonContainer.remove()
      rawJsonContainer.remove()
      document.body.prepend(originalPreElement)

      return { formatted: false, note: 'Does not parse as JSON', rawLength }
    }

    if (
      typeof parsedJsonValue !== 'object' &&
      !Array.isArray(parsedJsonValue)
    ) {
      return {
        formatted: false,
        note: 'Technically JSON but not an object or array',
        rawLength,
      }
    }

    // Status: it is a valid JSON object or array, and we have parsed the whole thing.
    const parsedJsonRootStruct = parsedJsonValue as JsonObject | JsonArray

    // Flesh out the UI and handle events
    {
      // Insert CSS
      const jfStyleEl = document.createElement('style')
      jfStyleEl.id = 'jfStyleEl'
      //jfStyleEl.innerText = 'body{padding:0;}' ;
      jfStyleEl.insertAdjacentHTML('beforeend', await cssPromise)
      document.head.appendChild(jfStyleEl)

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
        false
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
        false
      )

      optionBar.appendChild(buttonPlain)
      optionBar.appendChild(buttonFormatted)

      const buttonInject = document.createElement('button')
      buttonInject.innerText = 'Inject window.json'
      buttonInject.setAttribute('onclick', `window.json = JSON.parse(document.getElementById("jsonFormatterRaw").querySelector("pre").innerText)`)
      buttonInject.setAttribute('style', 'display: block; width: 100%; border-right: 1px solid #aaa;')
      buttonInject.id = "buttonPlain"
      optionBar.appendChild(buttonInject)
  
      document.body.prepend(optionBar)

      // Attach document-wide listener
      document.addEventListener('mousedown', generalClick)
    }

    // Do formatting and finalise DOM
    const rootEntry = buildDom(parsedJsonRootStruct, false)
    await Promise.resolve()
    parsedJsonContainer.append(rootEntry)

    // Export parsed JSON for easy access in console - DISABLED; doesn't work with manifest v3 - maybe re-enable later via background worker somehow
    // @ts-ignore
    // window.json = parsedJsonValue
    // console.log('JSON Formatter: Type "json" to inspect.')
  }

  return {
    formatted: true,
    note: 'done',
    rawLength,
  }

  function collapse(elements: HTMLElement[] | HTMLCollection) {
    let el, i, blockInner

    for (i = elements.length - 1; i >= 0; i--) {
      el = elements[i]
      el.classList.add('collapsed')

      // (CSS hides the contents and shows an ellipsis.)

      // Add a count of the number of child properties/items
      if (!el.id) {
        // TODO why is this id check needed?
        // Find the blockInner
        blockInner = el.firstElementChild
        while (blockInner && !blockInner.classList.contains('blockInner')) {
          blockInner = blockInner.nextElementSibling
        }
        if (!blockInner) continue
      }
    }
  }

  function expand(elements: HTMLElement[] | HTMLCollection) {
    for (let i = elements.length - 1; i >= 0; i--)
      elements[i].classList.remove('collapsed')
  }

  function generalClick(ev: MouseEvent) {
    const elem = ev.target
    if (!(elem instanceof HTMLElement)) return

    if (elem.className === 'e') {
      // It's a click on an expander.

      ev.preventDefault()

      const parent = elem.parentNode
      assert(parent instanceof HTMLElement)

      // Expand or collapse
      if (parent.classList.contains('collapsed')) {
        // EXPAND
        if (ev.metaKey || ev.ctrlKey) {
          const gp = parent.parentNode
          assert(gp instanceof HTMLElement)
          expand(gp.children)
        } else expand([parent])
      } else {
        // COLLAPSE
        if (ev.metaKey || ev.ctrlKey) {
          const gp = parent.parentNode
          assert(gp instanceof HTMLElement)
          collapse(gp.children)
        } else collapse([parent])
      }
    }
  }
})()

if (PERFORMANCE_DEBUGGING) {
  resultPromise.then((result) => {
    // @ts-ignore
    const startTime = window.__jsonFormatterStartTime as number
    const endTime = performance.now()

    const duration = endTime - startTime

    console.log('JSON Formatter', result)
    console.log('Duration:', Math.round(duration * 10) / 10, 'ms')
  })
}
