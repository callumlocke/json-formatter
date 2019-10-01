JSON Formatter
==============

Browser extension for printing JSON and JSONP nicely when you visit it 'directly' in a browser tab.

Features
--------

* JSONP support
* Fast, even on long pages
* Works on any valid JSON page – URL doesn't matter
* Syntax highlighting with 36 light and dark themes
* Collapsible trees, with indent guides
* Line numbers
* Clickable URLs
* Buttons for switching between raw and parsed JSON
* Parsed JSON is exported as a global variable, `json`, so you can inspect it in the console

A background worker is used to prevent the UI freezing when processing very long JSON pages.

Installation
------------

**Option 1** – Install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/mhimpmpmffogbmmkmajibklelopddmjf/) or [Windows Store](https://www.microsoft.com/en-us/store/p/json-formatter-for-edge/9nz9d2j86w6s).

**Option 2** – Install it from source:

1. Clone/download this repo
2. Install dependencies using [NPM](https://nodejs.org/) or [Yarn](https://yarnpkg.com/en/).
3. Build the extension: `gulp build:dist`
4. Side-load the extension in your browser as per below

Chrome

5. Open Chrome and go to `chrome://chrome/extensions/`
6. Enable "Developer mode"
7. Click "Load unpacked extension"
8. Select the `build` folder created in step 3

Edge

5. Open Edge and go to `about:flags`
6. Enable the option "Enable extension developer features" and restart the browser
7. Click on the ellipsis (...) menu, click "Extensions", and click "Load extension"
8. Select the `build` folder created in step 3

**Some URLs to try it on:**

* https://en.wikipedia.org/w/api.php?action=query&titles=Main%20Page&prop=contributors&format=json
* http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=jsonp&tags=json&tagmode=any&format=json
