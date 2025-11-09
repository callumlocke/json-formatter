# JSON Formatter - the original

Chrome extension that auto-formats JSON when you view it in a browser tab.

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

**Some JSON documents for testing it on:**
https://callumlocke.github.io/json-formatter/

## Installation

**Option 1 (recommended)** – Install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/bcjindcccaagfpapjjmafapmmgkkhgoa).

**Option 2** – Install it from source (see below).

### Development

**Requirements:** [Deno](https://deno.land/) (and [Node](https://nodejs.org/en/) for now).

**Initial setup:**

- Clone repo
- Run `pnpm i` to get TypeScript typings for chrome (or use `npm i` if you prefer)
- Optional: if using VSCode and you need to mess with the Deno build scripts, install the official Deno plugin and set `"deno.enablePaths": ["tasks"]`.

**To build it:**

- Run `deno task build`

**To build and rebuild whenever files change:**

- Run `deno task dev`

**Tests:**

- `deno task test`
- `deno task update-snapshots`

**To install your local build to Chrome**

- Open Chrome and go to `chrome://extensions`
- Enable "Developer mode",
- Click "Load unpacked",
- Select the `dist` folder you built above.

## FAQ

### Why are large numbers not displayed accurately?

This is a [limitation of JavaScript](http://www.ecma-international.org/ecma-262/5.1/#sec-15.7.3.2) and therefore a limitation of JSON as interpreted by your web browser.

- Anything above `Number.MAX_SAFE_INTEGER` (`2^53 - 1` or `9007199254740991`) is adjusted down to that number.
- Anything below `Number.MIN_SAFE_INTEGER` (`-2^53 + 1` or `-9007199254740991`) is adjusted up to that number.
- Extremely precise floating point numbers are rounded to 16 digits.

It's not JSON Formatter doing this, it's the native `JSON.parse` in V8. JSON Formatter shows you the **parsed** values, exactly the same as what you'll see after loading the JSON in JavaScript.

If your API endpoint really needs to represent numbers outside JavaScript's safe range, it should **quote them as strings**.

### Why are object keys sometimes in the wrong order?

What you see in JSON Formatter is a representation of the **parsed** object/array. It's the same order you'll get with `Object.keys( JSON.parse(json) )` in JavaScript.

Historically, the JavaScript standard explicitly stated that object keys can be iterated in any order, and V8 took advantage of this by moving numeric string keys (like `"1"` or `"99999"`) to the top to facilitate a small performance optimisation. This V8 implementation detail has since become standardised.

##### But I just want to see exactly what the server spits out

For now, your best option is to just use the "Raw" button to see the raw JSON. This is what the server sent. The "Parsed" buttons represents what you'll get from `JSON.parse`.

In future JSON Formatter might switch from using `JSON.parse` to a custom parser (if performance allows) in order to detect when a value has been 'changed' by parsing and show an appropriate warning.
