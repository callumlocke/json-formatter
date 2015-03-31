JSON Formatter
==============

Chrome extension for printing JSON and JSONP nicely when you visit it 'directly' in a browser tab.

Features
--------

* JSONP support
* Fast, even on long pages
* Works on any valid JSON page – URL doesn't matter
* Syntax highlighting
* Collapsible trees, with indent guides
* Clickable URLs
* Buttons for switching between raw and parsed JSON
* Parsed JSON is exported as a global variable, `json`, so you can inspect it in the console

A background worker is used to prevent the UI freezing when processing very long JSON pages.

Installation
------------

**Option 1** – just install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/bcjindcccaagfpapjjmafapmmgkkhgoa).

**Option 2** – install it from source:

* clone/download this repo,
* open Chrome and go to `chrome://chrome/extensions/`,
* enable "Developer mode",
* click "Load unpacked extension",
* select the `extension` folder in this repo.

**Some URLs to try it on:**

* http://feeds.delicious.com/v2/json/popular?callback=hello
* http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?alt=json&v=2
* http://twitter.com/statuses/public_timeline.json

FAQ
---

### Why are large numbers not displayed accurately?

This is a [limitation of JavaScript](http://www.ecma-international.org/ecma-262/5.1/#sec-15.7.3.2) (and therefore JSON). The largest possible number is `Number.MAX_SAFE_INTEGER`, or **9007199254740991**. If you try to use a number larger than this in JavaScript/JSON, you'll lose accuracy.

The idea of JSON Formatter is to show you how the computer sees your JSON, so we don't attempt to circumvent this limitation, otherwise that would give a misleading representation of your data. It's better to see exactly what V8 sees.

If you want to use long sequences of digits in your JSON, then **quote them as strings**.

### Why are object keys sometimes in the wrong order?

What you see in JSON Formatter is a representation of the **parsed** object/array. You see what V8 sees.

Plain JavaScript objects are [unordered collections of properties](http://www.ecma-international.org/ecma-262/5.1/#sec-12.6.4). If you go through them with `for...in`, for example, there is no guarantee of any particular order. In practice, most engines maintain the order in which the keys were first declared, but V8 moves any numeric keys (e.g. `"1234"`) to the front, for a small performance gain. This was a [controversial issue](https://code.google.com/p/v8/issues/detail?id=164) – a lot of people think it sucks that you can't predict key enumeration order in Chrome – but the V8 team refused to 'fix' it, because it's not a bug, and they're right. If you want your values to be in a certain order, and you're relying on the non-standard key-ordering logic of a particular engine, then your code is broken. Restructure your data to use arrays.

##### But I just want it to be in order for readability

That would require manually parsing the JSON string with regular expressions (instead of using `JSON.parse`), which would be too slow. And it's not a good idea to go down the road of representing the data differently from how the engine actually sees it.
