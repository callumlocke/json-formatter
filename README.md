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

**Option 2** – install it from souce:

* clone/download this repo,
* open Chrome and go to `chrome://chrome/extensions/`,
* enable "Developer mode",
* click "Load unpacked extension",
* select the `extension` folder in this repo.

**Some URLs to try it on:**

* http://feeds.delicious.com/v2/json/popular?callback=hello
* http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?alt=json&v=2
* http://twitter.com/statuses/public_timeline.json
