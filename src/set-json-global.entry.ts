/**
 * This extra content script exposes the parsed JSON data as a global variable `json` for easy inspection in the devtools console. Runs after the main content has loaded and parsed the JSON. Exits fast on non-JSON pages.
 */
;(() => {
  const pre = document.getElementById('jsonFormatterRaw')?.querySelector('pre')
  if (!pre) return // not a formatted JSON page

  // timeout to give time for the UI to settle
  setTimeout(() => {
    try {
      const data = JSON.parse(pre.innerText)
      Object.defineProperty(window, 'json', {
        value: data,
        configurable: true,
        enumerable: false,
        writable: false,
      })

      console.log('JSON Formatter: Type "json" to inspect')
    } catch (error) {
      console.error('JSON Formatter: Failed to expose JSON global', error)
    }
  }, 120)
})()
