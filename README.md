JSON Formatter
==============

Chrome extension for pretty-printing JSON and JSONP when you visit it 'directly'.

Features
--------

* JSONP support
* Fast, even on long pages
* Works on any valid JSON page – URL doesn't matter
* Syntax highlighting
* Collapsible trees, with indent guides
* Clickable URLs
* Buttons for switching between raw and parsed JSON

A background worker is used to prevent the UI freezing when processing very long JSON pages.

Installation
------------

Go here and install it:

https://chrome.google.com/webstore/detail/bcjindcccaagfpapjjmafapmmgkkhgoa

Or install from source:

* open Chrome and go to `chrome://chrome/extensions/`,
* enable "Developer mode",
* click "Load unpacked extension",
* select the `extension` subdirectory of this repo.

Some URLs to try it on:

* http://feeds.delicious.com/v2/json/popular?callback=hello
* http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?alt=json&v=2
* http://twitter.com/statuses/public_timeline.json