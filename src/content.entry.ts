import { assert } from './lib/assert'
import './lib/beforeAll'
import { buildDom } from './lib/buildDom'
import { getResult } from './lib/getResult'
import { JsonArray, JsonObject } from './lib/types'
// @ts-ignore
// import css from './style.css'
// @ts-ignore
// import darkThemeCss from './styleDark.css'

const css = `body {
  background-color: #fff;
  user-select: text;
  overflow-y: scroll !important;
  margin: 0;
  position: relative;
  padding-top: 1px; /* hack to prevent margin collapse in 'Raw' */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
#optionBar {
  user-select: none;
  position: absolute;
  z-index: 10;
  top: 8px;
  right: 10px;
  background: #fff;
  box-shadow: 0px 0px 3px 3px #fff;
  padding: 5px;
}
#buttonFormatted,
#buttonPlain {
  border-radius: 2px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  user-select: none;
  background: linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5);
  border: 1px solid #aaa;
  color: #444;
  font-size: 13px;
  /* text-transform: uppercase; */
  margin-bottom: 0px;
  min-width: 4em;
  padding: 3px 0;
  position: relative;
  z-index: 10;
  display: inline-block;
  width: 80px;
  text-shadow: 1px 1px rgba(255, 255, 255, 0.3);
}
#buttonFormatted {
  margin-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
#buttonPlain {
  margin-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}
:is(#buttonPlain, #buttonFormatted):not(.selected):hover {
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  background: #ebebeb linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9);
  border-color: #999;
  color: #222;
}
:is(#buttonPlain, #buttonFormatted):active {
  box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.2);
  background: #ebebeb linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc);
  color: #333;
}
:is(#buttonPlain, #buttonFormatted).selected {
  box-shadow: inset 0px 1px 5px rgba(0, 0, 0, 0.2);
  background: #ebebeb linear-gradient(#e4e4e4, #dfdfdf 40%, #dcdcdc);
  color: #333;
}
:is(#buttonPlain, #buttonFormatted):focus {
  outline: 0;
}
.entry {
  display: block;
  padding-left: 20px;
  margin-left: -20px;
  position: relative;
  content-visibility: auto;
}
#jsonFormatterParsed {
  padding-left: 28px;
  padding-top: 6px;
  line-height: 1.5;
}
#jsonFormatterRaw {
  padding: 36px 10px 5px;
}
.collapsed {
  white-space: nowrap;
}
.collapsed > .blockInner {
  display: none;
}
.collapsed > .ell:after {
  content: '…';
  font-weight: bold;
}
.collapsed > .ell {
  margin: 0 4px;
  color: #888;
}
.collapsed .entry {
  display: inline;
}

.collapsed:after {
  content: attr(data-size);
  color: #aaa;
}

.e {
  width: 20px;
  height: 18px;
  display: block;
  position: absolute;
  left: 0px;
  top: 1px;
  color: black;
  z-index: 5;
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
}

.e::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 6.9px;
  border-color: transparent transparent transparent currentColor;
  transform: rotate(90deg) translateY(1px);
}

.collapsed > .e::after {
  transform: none;
}

.e:hover {
  opacity: 0.35;
}
.e:active {
  opacity: 0.5;
}
.collapsed .entry .e {
  display: none;
}
.blockInner {
  display: block;
  padding-left: 24px;
  border-left: 1px dotted #bbb;
  margin-left: 2px;
}
#jsonFormatterParsed {
  color: #444;
}

.entry {
  font-size: 13px;
  font-family: monospace;
}

.b {
  font-weight: bold;
}
.s {
  color: #0b7500;
  word-wrap: break-word;
}
a:link,
a:visited {
  text-decoration: none;
  color: inherit;
}
a:hover,
a:active {
  text-decoration: underline;
  color: #050;
}
.bl,
.nl,
.n {
  font-weight: bold;
  color: #1a01cc;
}
.k {
  color: #000;
}

[hidden] {
  display: none !important;
}
span {
  white-space: pre-wrap;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

#spinner {
  animation: spin 2s linear infinite;
}
`
const darkThemeCss = `body {
  background-color: #1a1a1a;
  color: #eee;
  -webkit-font-smoothing: antialiased;
}

a:hover,
a:active {
  color: hsl(114, 90%, 55%);
}

#optionBar {
  -webkit-font-smoothing: subpixel-antialiased;

  background: #1a1a1a;
  box-shadow: 0px 0px 3px 3px #1a1a1a;
}

#jsonFormatterParsed {
  color: #b6b6b6;
}

.blockInner {
  border-color: #4d4d4d;
}

.k {
  color: #fff;
}

.s {
  color: hsl(114, 100%, 35%);
}

.bl,
.nl,
.n {
  color: hsl(200, 100%, 70%);
}

.e {
  color: #fff;
  opacity: 0.25;
}

.e:hover {
  opacity: 0.45;
}
.e:active {
  opacity: 0.6;
}

.collapsed:after {
  color: #707070;
}

:is(#buttonPlain, #buttonFormatted) {
  text-shadow: none;
  border: 0;
  background: hsl(200, 35%, 60%);
  box-shadow: none;
  color: #000;
}

:is(#buttonPlain, #buttonFormatted):not(.selected):hover {
  box-shadow: none;
  background: hsl(200, 50%, 70%);
  color: #000;
}

:is(#buttonPlain, #buttonFormatted).selected {
  box-shadow: inset 0px 1px 5px rgba(0, 0, 0, 0.7);
  background: hsl(200, 40%, 60%);
  color: #000;
}
`

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

const resultPromise = (async () => {
  const result = getResult(document)
  if (!result.formatted) return result

  const { element: originalPreElement, parsed: parsedJsonValue } = result

  {
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

      document.body.prepend(optionBar)

      // Attach document-wide listener
      document.addEventListener('mousedown', generalClick)
    }

    // Do formatting and finalise DOM
    const rootEntry = buildDom(parsedJsonRootStruct, false)
    await Promise.resolve()
    parsedJsonContainer.append(rootEntry)
  }

  // hide the pretty-print bar
  for (const el of document.getElementsByClassName(
    'json-formatter-container'
  )) {
    ;(el as HTMLElement).style.display = 'none'
  }

  return result

  function collapse(elements: HTMLElement[] | HTMLCollection) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i]
      el.classList.add('collapsed') // hides contents and shows an ellipsis
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
