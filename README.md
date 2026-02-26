> # ARCHIVED
> 
> I am no longer developing JSON Formatter as an open source project. I'm moving to a closed-source, commercial model in order to build a more comprehensive API-browsing tool with premium features.
>
> I know some users (especially here on GitHub) will always prefer open source tools, so I’m leaving this repo online for others to use/fork, and I’ve published the final open source version as [JSON Formatter Classic](https://chromewebstore.google.com/detail/json-formatter-classic/caacnjeoikecoeepknkbjdcaediamaej) – you can switch to that if you just want a simple, open source, local-only JSON-formatting extension that won't receive updates.

---

# JSON Formatter

Chrome extension that helps you view and explore JSON API responses.

## Features

- **Fast**, even on very long JSON pages
- Dark mode
- Syntax highlighting
- Collapsible trees, with indent guides
- Clickable URLs
- Negligible performance impact on non-JSON pages (less than 1 millisecond)
- Works on any valid JSON page – URL doesn't matter
- Buttons for toggling between raw and parsed JSON
- Parsed JSON is exported as a global variable, `json`, so you can inspect it in the console (now working again!)

## Installation

**Option 1** – Install [JSON Formatter Classic](https://chromewebstore.google.com/detail/json-formatter-classic/caacnjeoikecoeepknkbjdcaediamaej) from the Chrome Web Store.

**Option 2** – Install it from source (see below).

### Development

Clone repo and run `bun install`.

Commands:

- `bun run build` - single build
- `bun run watch` - same but watch-driven

You can install `dist` as a local, unpacked extension in Chrome with developer mode enabled.

## FAQ

### How does it detect JSON?

This turns out to be a complex thing to get right in a bulletproof way. In most cases it's based on the `Content-Type` header but in some cases it's necessary to inspect the 'page' strucure and see if it looks like a JSON endpoint. This is designed to work as fast as possible with no perceivable impact on browsing.

### Why are large numbers not displayed accurately?

This is a [limitation of JavaScript](http://www.ecma-international.org/ecma-262/5.1/#sec-15.7.3.2) and therefore a limitation of JSON as interpreted by your web browser.

- Anything over `Number.MAX_SAFE_INTEGER` (`2^53 - 1` or `9007199254740991`) is adjusted down to that number.
- Anything below `Number.MIN_SAFE_INTEGER` (`-2^53 + 1` or `-9007199254740991`) is adjusted up to that number.
- Extremely precise floating point numbers are rounded to 16 digits.

It's not JSON Formatter doing this, it's the native `JSON.parse` in V8. JSON Formatter shows you the **parsed** values, exactly the same as what you'll see if you fetch your JSON from any web application.

If your API endpoint really needs to represent numbers outside JavaScript's safe range, it should **quote them as strings**.

### Why are object keys sometimes in the wrong order?

What you see in JSON Formatter is a representation of the **parsed** object/array. It's the same order you'll get with `Object.keys( JSON.parse(json) )` in JavaScript.

Historically, the JavaScript standard explicitly stated that object keys can be iterated in any order, and V8 took advantage of this by moving numeric string keys (like `"1"` or `"99999"`) to the top to facilitate a small performance optimisation. This V8 implementation detail has since become standardised.

##### But I just want to see exactly what the server spits out

For now, your best option is to just use the "Raw" button to see the raw JSON. This is what the server sent. The "Parsed" buttons represents what you'll get from `JSON.parse`.

In future JSON Formatter might switch from using `JSON.parse` to a custom parser (if performance allows) in order to detect when a value has been 'changed' by parsing and show an appropriate warning.
