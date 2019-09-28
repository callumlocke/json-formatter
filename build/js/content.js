/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 56);
/******/ })
/************************************************************************/
/******/ ({

/***/ 10:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 21:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_messaging__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_theme_switcher__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_browser__ = __webpack_require__(4);




var jfContent = void 0;
var pre = void 0;
var jfStyleEl = void 0;
var slowAnalysisTimeout = void 0;

// Open the port 'jf' now, ready for when we need it
var port = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__lib_messaging__["a" /* connect */])();

// Add listener to receive response from BG when ready
port.onMessage.addListener(function (message) {
  switch (message[0]) {
    case 'NOT JSON':
      document.documentElement.style.color = null;
      break;

    case 'FORMATTING':
      convertPlainTextDocumentToPreIfNeeded();
      pre = document.querySelector('body > pre');
      pre.hidden = true;

      // It is JSON, and it's now being formatted in the background worker.
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_theme_switcher__["a" /* enableTheming */])();

      // Add jfContent DIV, ready to display stuff
      jfContent = document.createElement('div');
      jfContent.id = 'jfContent';
      document.body.appendChild(jfContent);

      // Clear the slowAnalysisTimeout (if the BG worker had taken longer than 1s to respond with an answer to whether or not this is JSON, then it would have fired, unhiding the PRE... But now that we know it's JSON, we can clear this timeout, ensuring the PRE stays hidden.)
      clearTimeout(slowAnalysisTimeout);

      jfContent.innerHTML = '<p id="formattingMsg"><svg id="spinner" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path></svg> Formatting...</p>';

      var formattingMsg = document.getElementById('formattingMsg');
      formattingMsg.hidden = true;
      setTimeout(function () {
        formattingMsg.hidden = false;
      }, 250);

      insertFormatOptionBar();

      break;

    case 'FORMATTED':
      // Insert HTML content
      jfContent.innerHTML = message[1];
      pre.hidden = true;

      // Export parsed JSON for easy access in console
      // Only works if target page's CSP allows it
      setTimeout(function () {
        var script = document.createElement('script');
        script.innerHTML = '\n          window.json=' + message[2] + ';\n          console.info("JSON Formatter: Type \'json\' to inspect.");\n        ';
        document.head.appendChild(script);
      }, 100);

      // Attach event handlers
      document.addEventListener('click', generalClick, false);

      break;

    default:
      throw new Error('Message not understood: ' + message[0]);
  }
});

function insertFormatOptionBar() {
  var formatBar = document.createElement('div');
  formatBar.id = 'formatOptionBar';
  formatBar.classList.add('optionBar');

  var buttonPlain = document.createElement('button');
  var buttonFormatted = document.createElement('button');
  buttonPlain.id = 'buttonPlain';
  buttonPlain.innerText = 'Raw';
  buttonFormatted.id = 'buttonFormatted';
  buttonFormatted.innerText = 'Parsed';
  buttonFormatted.classList.add('selected');

  buttonPlain.addEventListener('click', function () {
    pre.hidden = false;
    jfContent.hidden = true;
    buttonFormatted.classList.remove('selected');
    buttonPlain.classList.add('selected');
  });

  buttonFormatted.addEventListener('click', function () {
    pre.hidden = true;
    jfContent.hidden = false;
    buttonFormatted.classList.add('selected');
    buttonPlain.classList.remove('selected');
  });

  document.addEventListener('keyup', function (e) {
    if (e.keyCode === 37 && typeof buttonPlain !== 'undefined') {
      buttonPlain.click();
    } else if (e.keyCode === 39 && typeof buttonFormatted !== 'undefined') {
      buttonFormatted.click();
    }
  });

  formatBar.appendChild(buttonPlain);
  formatBar.appendChild(buttonFormatted);
  document.body.insertBefore(formatBar, pre);
}

function ready() {
  // First, check if it's plain text and exit if not
  var plainText = getTextFromTextOnlyDocument();
  if (!plainText || plainText.length > 300000) {
    // If there is plain text and it's over 3MB, send alert
    plainText && alert('JSON Formatter Error: Cannot parse JSON larger than 3MB');
    port.disconnect();
    return;
  }

  // Hide the text immediately (until we know what to do, to prevent a flash of unstyled content)
  document.documentElement.style.color = 'transparent';
  slowAnalysisTimeout = setTimeout(function () {
    document.documentElement.style.color = null;
  }, 1000);

  // Send the text to the background script
  port.postMessage({
    type: 'SENDING TEXT',
    text: plainText
  });
}

function getTextFromTextOnlyDocument() {
  var bodyChildren = document.body.childNodes;
  var firstChild = bodyChildren[0];

  var bodyHasOnlyOneElement = document.body.childNodes.length === 1;
  var isPre = isPreElement(firstChild);
  var isPlainText = isPlainTextElement(firstChild);

  if (bodyHasOnlyOneElement && (isPre || isPlainText)) {
    return firstChild.innerText || firstChild.nodeValue;
  }
}

function convertPlainTextDocumentToPreIfNeeded() {
  if (isPlainTextDocument()) {
    var plainTextNode = document.body.childNodes[0];
    var preElement = document.createElement('pre');
    preElement.innerText = plainTextNode.nodeValue;
    document.body.appendChild(preElement);
    document.body.removeChild(plainTextNode);
  }
}

function isPlainTextDocument() {
  return document.body.childNodes.length === 1 && isPlainTextElement(document.body.childNodes[0]);
}

function isPreElement(element) {
  return element.tagName === 'PRE';
}

function isPlainTextElement(element) {
  return element.nodeType === Node.TEXT_NODE;
}

document.addEventListener('DOMContentLoaded', ready, false);

var lastKeyValueOrValueIdGiven = 0;
function collapse(elements) {

  for (var i = elements.length - 1; i >= 0; i--) {
    var blockInner = void 0,
        count = void 0;
    var el = elements[i];
    el.classList.add('collapsed');

    // (CSS hides the contents and shows an ellipsis.)

    // Add a count of the number of child properties/items (if not already done for this item)
    if (!el.id) {
      el.id = 'keyValueOrValue' + ++lastKeyValueOrValueIdGiven;

      // Find the blockInner
      blockInner = el.firstElementChild;
      while (blockInner && !blockInner.classList.contains('blockInner')) {
        blockInner = blockInner.nextElementSibling;
      }
      if (!blockInner) {
        continue;
      }

      // See how many children in the blockInner
      count = blockInner.children.length;

      // Generate comment text eg '4 items'
      var comment = count + (count === 1 ? ' item' : ' items');
      // Add CSS that targets it
      port.postMessage({
        type: 'INSERT CSS',
        code: '#keyValueOrValue' + lastKeyValueOrValueIdGiven + '.collapsed:after{content:" // ' + comment + '"}'
      });
    }
  }
}

function expand(elements) {
  for (var i = elements.length - 1; i >= 0; i--) {
    elements[i].classList.remove('collapsed');
  }
}

var mac = navigator.platform.indexOf('Mac') !== -1;
var modKey = void 0;
if (mac) {
  modKey = function modKey(ev) {
    return ev.metaKey;
  };
} else {
  modKey = function modKey(ev) {
    return ev.ctrlKey;
  };
}

function generalClick(ev) {
  if (ev.which === 1) {
    var elem = ev.target;

    if (elem.className === 'expander') {
      ev.preventDefault();

      var parent = elem.parentNode;
      var div = jfContent;
      var scrollTop = document.body.scrollTop;

      if (parent.classList.contains('collapsed')) {
        // EXPAND
        if (modKey(ev)) {
          expand(parent.parentNode.children);
        } else {
          expand([parent]);
        }
      } else {
        // COLLAPSE
        if (modKey(ev)) {
          collapse(parent.parentNode.children);
        } else {
          collapse([parent]);
        }
      }

      // Restore scrollTop somehow
      // Clear current extra margin, if any
      div.style.marginBottom = 0;

      // No need to worry if all content fits in viewport
      if (document.body.offsetHeight < window.innerHeight) {
        return;
      }

      // And no need to worry if scrollTop still the same
      if (document.body.scrollTop === scrollTop) {
        return;
      }

      // The body has got a bit shorter.
      // We need to increase the body height by a bit (by increasing the bottom margin on the jfContent div). The amount to increase it is whatever is the difference between our previous scrollTop and our new one.

      // Work out how much more our target scrollTop is than this.
      var difference = scrollTop - document.body.scrollTop + 8; // it always loses 8px; don't know why

      // Add this difference to the bottom margin
      div.style.marginBottom = difference + 'px';

      // Now change the scrollTop back to what it was
      document.body.scrollTop = scrollTop;

      return;
    }
  }
}

/***/ }),

/***/ 25:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableTheming;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__themes__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__messaging__ = __webpack_require__(6);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };




var transitionStyles = __webpack_require__(48);
var port = void 0,
    transitionStylesInject = void 0;

function enableTheming() {
  port = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__messaging__["a" /* connect */])();
  port.onMessage.addListener(function (message) {
    if (message.type === 'STORED THEME') {
      switchToTheme(message.themeName);
    }
  });
  insertThemeOptionBar();
}

function insertThemeOptionBar() {
  var themeBar = document.createElement('div');
  themeBar.id = 'themeOptionBar';
  themeBar.classList.add('optionBar');

  var label = document.createElement('label');
  var select = document.createElement('select');
  label.innerText = 'Theme: ';
  select.id = 'themeSelect';
  select.innerHTML = generateOptionsHTML();

  select.addEventListener('change', function () {
    port.postMessage({ type: 'UPDATE STORED THEME', theme: select.value });
    select.blur();
  });

  label.appendChild(select);
  themeBar.appendChild(label);
  document.body.insertBefore(themeBar, document.body.childNodes[0]);
  port.postMessage({ type: 'GET STORED THEME' });
}

function getThemeSelect() {
  return document.getElementById('themeSelect');
}

function getThemesNestedByType() {
  return Object.keys(__WEBPACK_IMPORTED_MODULE_0__themes__["a" /* themes */]).reduce(function (output, key) {
    var theme = __WEBPACK_IMPORTED_MODULE_0__themes__["a" /* themes */][key];
    if ((typeof theme === 'undefined' ? 'undefined' : _typeof(theme)) === 'object') {
      output[theme.type] = output[theme.type] || [];
      output[theme.type][key] = theme;
    }
    return output;
  }, {});
}

function generateOptionsHTML() {
  var nestedThemes = getThemesNestedByType();

  return Object.keys(nestedThemes).map(function (groupName) {
    var themeGroup = nestedThemes[groupName];
    var groupOptions = Object.keys(themeGroup).map(function (key) {
      var theme = themeGroup[key];
      return '<option value="' + key + '">' + theme.name + '</option>';
    }).join('');

    return '<optgroup label="' + groupName + '">' + groupOptions + '</optgroup>';
  }).join('');
}

function switchToTheme(themeName) {
  themeName = __WEBPACK_IMPORTED_MODULE_0__themes__["a" /* themes */][themeName] ? themeName : __WEBPACK_IMPORTED_MODULE_0__themes__["a" /* themes */].default;
  document.body.className = 'theme-' + themeName;

  var themeSelect = getThemeSelect();
  var themeSelectOption = themeSelect && themeSelect.querySelector('[value="' + themeName + '"]');
  if (themeSelectOption) {
    themeSelectOption.selected = true;
  }

  insertTransitionStylesOnce();
}

function insertTransitionStylesOnce() {
  if (!transitionStylesInject) {
    transitionStylesInject = true;
    window.setTimeout(function () {
      port.postMessage({
        type: 'INSERT CSS',
        code: transitionStyles
      });
    }, 1000);
  }
}

/***/ }),

/***/ 26:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return themes; });
var themes = {
  default: 'dawn',
  chrome: {
    name: 'Chrome',
    type: 'Light'
  },
  clouds: {
    name: 'Clouds',
    type: 'Light'
  },
  crimsonEditor: {
    name: 'Crimson Editor',
    type: 'Light'
  },
  dawn: {
    name: 'Dawn',
    type: 'Light'
  },
  dreamweaver: {
    name: 'Dreamweaver',
    type: 'Light'
  },
  eclipse: {
    name: 'Eclipse',
    type: 'Light'
  },
  github: {
    name: 'GitHub',
    type: 'Light'
  },
  iplastic: {
    name: 'iPlastic',
    type: 'Light'
  },
  katzenMilch: {
    name: 'KatzenMilch',
    type: 'Light'
  },
  kuroir: {
    name: 'Kuroir',
    type: 'Light'
  },
  solarizedLight: {
    name: 'Solarized Light',
    type: 'Light'
  },
  sqlServer: {
    name: 'SQL Server',
    type: 'Light'
  },
  textmate: {
    name: 'TextMate',
    type: 'Light'
  },
  tomorrow: {
    name: 'Tomorrow',
    type: 'Light'
  },
  xcode: {
    name: 'XCode',
    type: 'Light'
  },
  ambiance: {
    name: 'Ambiance',
    type: 'Dark'
  },
  chaos: {
    name: 'Chaos',
    type: 'Dark'
  },
  cloudsMidnight: {
    name: 'Clouds Midnight',
    type: 'Dark'
  },
  cobalt: {
    name: 'Cobalt',
    type: 'Dark'
  },
  gob: {
    name: 'Gob',
    type: 'Dark'
  },
  gruvbox: {
    name: 'Gruvbox',
    type: 'Dark'
  },
  idleFingers: {
    name: 'idle Fingers',
    type: 'Dark'
  },
  krTheme: {
    name: 'krTheme',
    type: 'Dark'
  },
  merbivore: {
    name: 'Merbivore',
    type: 'Dark'
  },
  merbivoreSoft: {
    name: 'Merbivore Soft',
    type: 'Dark'
  },
  monoIndustrial: {
    name: 'Mono Industrial',
    type: 'Dark'
  },
  monokai: {
    name: 'Monokai',
    type: 'Dark'
  },
  pastelOnDark: {
    name: 'Pastel on dark',
    type: 'Dark'
  },
  solarizedDark: {
    name: 'Solarized Dark',
    type: 'Dark'
  },
  terminal: {
    name: 'Terminal',
    type: 'Dark'
  },
  tomorrowNight: {
    name: 'Tomorrow Night',
    type: 'Dark'
  },
  tomorrowNightBlue: {
    name: 'Tomorrow Night Blue',
    type: 'Dark'
  },
  tomorrowNightBright: {
    name: 'Tomorrow Night Bright',
    type: 'Dark'
  },
  tomorrowNightEighties: {
    name: 'Tomorrow Night ’80s',
    type: 'Dark'
  },
  twilight: {
    name: 'Twilight',
    type: 'Dark'
  },
  vibrantInk: {
    name: 'Vibrant Ink',
    type: 'Dark'
  }
};

/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(false);
// imports


// module
exports.push([module.i, "body{transition-property:background-color,color;transition-duration:.5s;transition-delay:0s;transition-timing-function:cubic-bezier(.215,.61,.355,1)}::-moz-selection{transition-property:background-color,color;transition-duration:.5s;transition-delay:0s;transition-timing-function:cubic-bezier(.215,.61,.355,1)}::selection{transition-property:background-color,color;transition-duration:.5s;transition-delay:0s;transition-timing-function:cubic-bezier(.215,.61,.355,1)}#gutter,.bool,.brace,.collapsed:after,.key,.null,.number,.string,[line-number]:before{transition-property:background-color,color;transition-duration:.5s;transition-delay:0s;transition-timing-function:cubic-bezier(.215,.61,.355,1)}", ""]);

// exports


/***/ }),

/***/ 4:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


/* harmony default export */ __webpack_exports__["a"] = ({
  get runtime() {
    return getBrowser().runtime;
  },
  get storage() {
    return getBrowser().storage;
  },
  get tabs() {
    return getBrowser().tabs;
  }
});

function getBrowser() {
  return typeof browser !== 'undefined' ? browser : chrome;
}

/***/ }),

/***/ 48:
/***/ (function(module, exports, __webpack_require__) {


        var result = __webpack_require__(31);

        if (typeof result === "string") {
            module.exports = result;
        } else {
            module.exports = result.toString();
        }
    

/***/ }),

/***/ 56:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(21);


/***/ }),

/***/ 6:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = connect;
/* harmony export (immutable) */ __webpack_exports__["b"] = listen;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__browser__ = __webpack_require__(4);


function connect() {
  return __WEBPACK_IMPORTED_MODULE_0__browser__["a" /* default */].runtime.connect({ name: 'jf' });
}

function listen(onMessageReceived) {
  __WEBPACK_IMPORTED_MODULE_0__browser__["a" /* default */].runtime.onConnect.addListener(function (port) {
    if (port.name !== 'jf') {
      console.log('JSON Formatter error - unknown port name ' + port.name, port);
      return;
    }

    port.onMessage.addListener(function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return onMessageReceived.apply(undefined, [port].concat(args));
    });
  });
}

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2JmNThkNTdmZDQ2OGFkYTRiZjg/NTI3NyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzP2RhMDQiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2NvbnRlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2xpYi90aGVtZS1zd2l0Y2hlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvbGliL3RoZW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2Fzcy90cmFuc2l0aW9uLnNjc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2xpYi9icm93c2VyLmpzP2UyYjYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Nhc3MvdHJhbnNpdGlvbi5zY3NzPzEyMGUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2xpYi9tZXNzYWdpbmcuanM/ZTA0OSJdLCJuYW1lcyI6WyJqZkNvbnRlbnQiLCJwcmUiLCJqZlN0eWxlRWwiLCJzbG93QW5hbHlzaXNUaW1lb3V0IiwicG9ydCIsImNvbm5lY3QiLCJvbk1lc3NhZ2UiLCJhZGRMaXN0ZW5lciIsIm1lc3NhZ2UiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInN0eWxlIiwiY29sb3IiLCJjb252ZXJ0UGxhaW5UZXh0RG9jdW1lbnRUb1ByZUlmTmVlZGVkIiwicXVlcnlTZWxlY3RvciIsImhpZGRlbiIsImVuYWJsZVRoZW1pbmciLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJjbGVhclRpbWVvdXQiLCJpbm5lckhUTUwiLCJmb3JtYXR0aW5nTXNnIiwiZ2V0RWxlbWVudEJ5SWQiLCJzZXRUaW1lb3V0IiwiaW5zZXJ0Rm9ybWF0T3B0aW9uQmFyIiwic2NyaXB0IiwiaGVhZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJnZW5lcmFsQ2xpY2siLCJFcnJvciIsImZvcm1hdEJhciIsImNsYXNzTGlzdCIsImFkZCIsImJ1dHRvblBsYWluIiwiYnV0dG9uRm9ybWF0dGVkIiwiaW5uZXJUZXh0IiwicmVtb3ZlIiwiZSIsImtleUNvZGUiLCJjbGljayIsImluc2VydEJlZm9yZSIsInJlYWR5IiwicGxhaW5UZXh0IiwiZ2V0VGV4dEZyb21UZXh0T25seURvY3VtZW50IiwibGVuZ3RoIiwiYWxlcnQiLCJkaXNjb25uZWN0IiwicG9zdE1lc3NhZ2UiLCJ0eXBlIiwidGV4dCIsImJvZHlDaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJmaXJzdENoaWxkIiwiYm9keUhhc09ubHlPbmVFbGVtZW50IiwiaXNQcmUiLCJpc1ByZUVsZW1lbnQiLCJpc1BsYWluVGV4dCIsImlzUGxhaW5UZXh0RWxlbWVudCIsIm5vZGVWYWx1ZSIsImlzUGxhaW5UZXh0RG9jdW1lbnQiLCJwbGFpblRleHROb2RlIiwicHJlRWxlbWVudCIsInJlbW92ZUNoaWxkIiwiZWxlbWVudCIsInRhZ05hbWUiLCJub2RlVHlwZSIsIk5vZGUiLCJURVhUX05PREUiLCJsYXN0S2V5VmFsdWVPclZhbHVlSWRHaXZlbiIsImNvbGxhcHNlIiwiZWxlbWVudHMiLCJpIiwiYmxvY2tJbm5lciIsImNvdW50IiwiZWwiLCJmaXJzdEVsZW1lbnRDaGlsZCIsImNvbnRhaW5zIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiY2hpbGRyZW4iLCJjb21tZW50IiwiY29kZSIsImV4cGFuZCIsIm1hYyIsIm5hdmlnYXRvciIsInBsYXRmb3JtIiwiaW5kZXhPZiIsIm1vZEtleSIsImV2IiwibWV0YUtleSIsImN0cmxLZXkiLCJ3aGljaCIsImVsZW0iLCJ0YXJnZXQiLCJjbGFzc05hbWUiLCJwcmV2ZW50RGVmYXVsdCIsInBhcmVudCIsInBhcmVudE5vZGUiLCJkaXYiLCJzY3JvbGxUb3AiLCJtYXJnaW5Cb3R0b20iLCJvZmZzZXRIZWlnaHQiLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsImRpZmZlcmVuY2UiLCJ0cmFuc2l0aW9uU3R5bGVzIiwicmVxdWlyZSIsInRyYW5zaXRpb25TdHlsZXNJbmplY3QiLCJzd2l0Y2hUb1RoZW1lIiwidGhlbWVOYW1lIiwiaW5zZXJ0VGhlbWVPcHRpb25CYXIiLCJ0aGVtZUJhciIsImxhYmVsIiwic2VsZWN0IiwiZ2VuZXJhdGVPcHRpb25zSFRNTCIsInRoZW1lIiwidmFsdWUiLCJibHVyIiwiZ2V0VGhlbWVTZWxlY3QiLCJnZXRUaGVtZXNOZXN0ZWRCeVR5cGUiLCJPYmplY3QiLCJrZXlzIiwidGhlbWVzIiwicmVkdWNlIiwib3V0cHV0Iiwia2V5IiwibmVzdGVkVGhlbWVzIiwibWFwIiwiZ3JvdXBOYW1lIiwidGhlbWVHcm91cCIsImdyb3VwT3B0aW9ucyIsIm5hbWUiLCJqb2luIiwiZGVmYXVsdCIsInRoZW1lU2VsZWN0IiwidGhlbWVTZWxlY3RPcHRpb24iLCJzZWxlY3RlZCIsImluc2VydFRyYW5zaXRpb25TdHlsZXNPbmNlIiwiY2hyb21lIiwiY2xvdWRzIiwiY3JpbXNvbkVkaXRvciIsImRhd24iLCJkcmVhbXdlYXZlciIsImVjbGlwc2UiLCJnaXRodWIiLCJpcGxhc3RpYyIsImthdHplbk1pbGNoIiwia3Vyb2lyIiwic29sYXJpemVkTGlnaHQiLCJzcWxTZXJ2ZXIiLCJ0ZXh0bWF0ZSIsInRvbW9ycm93IiwieGNvZGUiLCJhbWJpYW5jZSIsImNoYW9zIiwiY2xvdWRzTWlkbmlnaHQiLCJjb2JhbHQiLCJnb2IiLCJncnV2Ym94IiwiaWRsZUZpbmdlcnMiLCJrclRoZW1lIiwibWVyYml2b3JlIiwibWVyYml2b3JlU29mdCIsIm1vbm9JbmR1c3RyaWFsIiwibW9ub2thaSIsInBhc3RlbE9uRGFyayIsInNvbGFyaXplZERhcmsiLCJ0ZXJtaW5hbCIsInRvbW9ycm93TmlnaHQiLCJ0b21vcnJvd05pZ2h0Qmx1ZSIsInRvbW9ycm93TmlnaHRCcmlnaHQiLCJ0b21vcnJvd05pZ2h0RWlnaHRpZXMiLCJ0d2lsaWdodCIsInZpYnJhbnRJbmsiLCJydW50aW1lIiwiZ2V0QnJvd3NlciIsInN0b3JhZ2UiLCJ0YWJzIiwiYnJvd3NlciIsImxpc3RlbiIsIm9uTWVzc2FnZVJlY2VpdmVkIiwib25Db25u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Ozs7Ozs7OztBQ1BBO0FBQUE7QUFBQTtBQUFBOztBQUVPLFNBQVN0SSxPQUFULEdBQW1CO0FBQ3hCLFNBQU84Syx5REFBT0EsQ0FBQ0osT0FBUixDQUFnQjFLLE9BQWhCLENBQXdCLEVBQUMrSCxNQUFNLElBQVAsRUFBeEIsQ0FBUDtBQUNEOztBQUVNLFNBQVNnRCxNQUFULENBQWdCQyxpQkFBaEIsRUFBbUM7QUFDeENGLDJEQUFPQSxDQUFDSixPQUFSLENBQWdCTyxTQUFoQixDQUEwQi9LLFdBQTFCLENBQXNDLFVBQUNILElBQUQsRUFBVTtBQUM5QyxRQUFJQSxLQUFLZ0ksSUFBTCxLQUFjLElBQWxCLEVBQXdCO0FBQ3RCbUQsY0FBUUMsR0FBUiwrQ0FBd0RwTCxLQUFLZ0ksSUFBN0QsRUFBcUVoSSxJQUFyRTtBQUNBO0FBQ0Q7O0FBRURBLFNBQUtFLFNBQUwsQ0FBZUMsV0FBZixDQUEyQjtBQUFBLHdDQUFJa0wsSUFBSjtBQUFJQSxZQUFKO0FBQUE7O0FBQUEsYUFBYUosb0NBQWtCakwsSUFBbEIsU0FBMkJxTCxJQUEzQixFQUFiO0FBQUEsS0FBM0I7QUFDRCxHQVBEO0FBUUQsQyIsImZpbGUiOiJjb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1Nik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgM2JmNThkNTdmZDQ2OGFkYTRiZjgiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJy4vbGliL21lc3NhZ2luZyc7XG5pbXBvcnQgeyBlbmFibGVUaGVtaW5nIH0gZnJvbSAnLi9saWIvdGhlbWUtc3dpdGNoZXInO1xuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIi4vbGliL2Jyb3dzZXJcIjtcblxubGV0IGpmQ29udGVudDtcbmxldCBwcmU7XG5sZXQgamZTdHlsZUVsO1xubGV0IHNsb3dBbmFseXNpc1RpbWVvdXQ7XG5cbi8vIE9wZW4gdGhlIHBvcnQgJ2pmJyBub3csIHJlYWR5IGZvciB3aGVuIHdlIG5lZWQgaXRcbmNvbnN0IHBvcnQgPSBjb25uZWN0KCk7XG5cbi8vIEFkZCBsaXN0ZW5lciB0byByZWNlaXZlIHJlc3BvbnNlIGZyb20gQkcgd2hlbiByZWFkeVxucG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obWVzc2FnZSkge1xuICBzd2l0Y2ggKG1lc3NhZ2VbMF0pIHtcbiAgICBjYXNlICdOT1QgSlNPTicgOlxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmNvbG9yID0gbnVsbDtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnRk9STUFUVElORycgOlxuICAgICAgY29udmVydFBsYWluVGV4dERvY3VtZW50VG9QcmVJZk5lZWRlZCgpO1xuICAgICAgcHJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keSA+IHByZScpO1xuICAgICAgcHJlLmhpZGRlbiA9IHRydWU7XG5cbiAgICAgIC8vIEl0IGlzIEpTT04sIGFuZCBpdCdzIG5vdyBiZWluZyBmb3JtYXR0ZWQgaW4gdGhlIGJhY2tncm91bmQgd29ya2VyLlxuICAgICAgZW5hYmxlVGhlbWluZygpO1xuXG4gICAgICAvLyBBZGQgamZDb250ZW50IERJViwgcmVhZHkgdG8gZGlzcGxheSBzdHVmZlxuICAgICAgamZDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBqZkNvbnRlbnQuaWQgPSAnamZDb250ZW50JztcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoamZDb250ZW50KTtcblxuICAgICAgLy8gQ2xlYXIgdGhlIHNsb3dBbmFseXNpc1RpbWVvdXQgKGlmIHRoZSBCRyB3b3JrZXIgaGFkIHRha2VuIGxvbmdlciB0aGFuIDFzIHRvIHJlc3BvbmQgd2l0aCBhbiBhbnN3ZXIgdG8gd2hldGhlciBvciBub3QgdGhpcyBpcyBKU09OLCB0aGVuIGl0IHdvdWxkIGhhdmUgZmlyZWQsIHVuaGlkaW5nIHRoZSBQUkUuLi4gQnV0IG5vdyB0aGF0IHdlIGtub3cgaXQncyBKU09OLCB3ZSBjYW4gY2xlYXIgdGhpcyB0aW1lb3V0LCBlbnN1cmluZyB0aGUgUFJFIHN0YXlzIGhpZGRlbi4pXG4gICAgICBjbGVhclRpbWVvdXQoc2xvd0FuYWx5c2lzVGltZW91dCk7XG5cbiAgICAgIGpmQ29udGVudC5pbm5lckhUTUwgPSAnPHAgaWQ9XCJmb3JtYXR0aW5nTXNnXCI+PHN2ZyBpZD1cInNwaW5uZXJcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDMwMCAzMDBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiPjxwYXRoIGQ9XCJNIDE1MCwwIGEgMTUwLDE1MCAwIDAsMSAxMDYuMDY2LDI1Ni4wNjYgbCAtMzUuMzU1LC0zNS4zNTUgYSAtMTAwLC0xMDAgMCAwLDAgLTcwLjcxMSwtMTcwLjcxMSB6XCIgZmlsbD1cIiMzZDdmZTZcIj48L3BhdGg+PC9zdmc+IEZvcm1hdHRpbmcuLi48L3A+JztcblxuICAgICAgY29uc3QgZm9ybWF0dGluZ01zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtYXR0aW5nTXNnJyk7XG4gICAgICBmb3JtYXR0aW5nTXNnLmhpZGRlbiA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3JtYXR0aW5nTXNnLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgfSwgMjUwKTtcblxuICAgICAgaW5zZXJ0Rm9ybWF0T3B0aW9uQmFyKCk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnRk9STUFUVEVEJyA6XG4gICAgICAvLyBJbnNlcnQgSFRNTCBjb250ZW50XG4gICAgICBqZkNvbnRlbnQuaW5uZXJIVE1MID0gbWVzc2FnZVsxXTtcbiAgICAgIHByZS5oaWRkZW4gPSB0cnVlO1xuXG4gICAgICAvLyBFeHBvcnQgcGFyc2VkIEpTT04gZm9yIGVhc3kgYWNjZXNzIGluIGNvbnNvbGVcbiAgICAgIC8vIE9ubHkgd29ya3MgaWYgdGFyZ2V0IHBhZ2UncyBDU1AgYWxsb3dzIGl0XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgc2NyaXB0LmlubmVySFRNTCA9IGBcbiAgICAgICAgICB3aW5kb3cuanNvbj0ke21lc3NhZ2VbMl19O1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkpTT04gRm9ybWF0dGVyOiBUeXBlICdqc29uJyB0byBpbnNwZWN0LlwiKTtcbiAgICAgICAgYDtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgfSwgMTAwKTtcblxuICAgICAgLy8gQXR0YWNoIGV2ZW50IGhhbmRsZXJzXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGdlbmVyYWxDbGljaywgZmFsc2UpO1xuXG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQgOlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNZXNzYWdlIG5vdCB1bmRlcnN0b29kOiAke21lc3NhZ2VbMF19YCk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBpbnNlcnRGb3JtYXRPcHRpb25CYXIoKSB7XG4gIGNvbnN0IGZvcm1hdEJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBmb3JtYXRCYXIuaWQgPSAnZm9ybWF0T3B0aW9uQmFyJztcbiAgZm9ybWF0QmFyLmNsYXNzTGlzdC5hZGQoJ29wdGlvbkJhcicpO1xuXG4gIGNvbnN0IGJ1dHRvblBsYWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGNvbnN0IGJ1dHRvbkZvcm1hdHRlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBidXR0b25QbGFpbi5pZCA9ICdidXR0b25QbGFpbic7XG4gIGJ1dHRvblBsYWluLmlubmVyVGV4dCA9ICdSYXcnO1xuICBidXR0b25Gb3JtYXR0ZWQuaWQgPSAnYnV0dG9uRm9ybWF0dGVkJztcbiAgYnV0dG9uRm9ybWF0dGVkLmlubmVyVGV4dCA9ICdQYXJzZWQnO1xuICBidXR0b25Gb3JtYXR0ZWQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcblxuICBidXR0b25QbGFpbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBwcmUuaGlkZGVuID0gZmFsc2U7XG4gICAgamZDb250ZW50LmhpZGRlbiA9IHRydWU7XG4gICAgYnV0dG9uRm9ybWF0dGVkLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgYnV0dG9uUGxhaW4uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgfSk7XG5cbiAgYnV0dG9uRm9ybWF0dGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHByZS5oaWRkZW4gPSB0cnVlO1xuICAgIGpmQ29udGVudC5oaWRkZW4gPSBmYWxzZTtcbiAgICBidXR0b25Gb3JtYXR0ZWQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgICBidXR0b25QbGFpbi5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS5rZXlDb2RlID09PSAzNyAmJiB0eXBlb2YgYnV0dG9uUGxhaW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBidXR0b25QbGFpbi5jbGljaygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT09IDM5ICYmIHR5cGVvZiBidXR0b25Gb3JtYXR0ZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBidXR0b25Gb3JtYXR0ZWQuY2xpY2soKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZvcm1hdEJhci5hcHBlbmRDaGlsZChidXR0b25QbGFpbik7XG4gIGZvcm1hdEJhci5hcHBlbmRDaGlsZChidXR0b25Gb3JtYXR0ZWQpO1xuICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShmb3JtYXRCYXIsIHByZSk7XG59XG5cbmZ1bmN0aW9uIHJlYWR5KCkge1xuICAvLyBGaXJzdCwgY2hlY2sgaWYgaXQncyBwbGFpbiB0ZXh0IGFuZCBleGl0IGlmIG5vdFxuICBjb25zdCBwbGFpblRleHQgPSBnZXRUZXh0RnJvbVRleHRPbmx5RG9jdW1lbnQoKTtcbiAgaWYgKCFwbGFpblRleHQgfHwgcGxhaW5UZXh0Lmxlbmd0aCA+IDMwMDAwMCkge1xuICAgIC8vIElmIHRoZXJlIGlzIHBsYWluIHRleHQgYW5kIGl0J3Mgb3ZlciAzTUIsIHNlbmQgYWxlcnRcbiAgICBwbGFpblRleHQgJiYgYWxlcnQoJ0pTT04gRm9ybWF0dGVyIEVycm9yOiBDYW5ub3QgcGFyc2UgSlNPTiBsYXJnZXIgdGhhbiAzTUInKTtcbiAgICBwb3J0LmRpc2Nvbm5lY3QoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBIaWRlIHRoZSB0ZXh0IGltbWVkaWF0ZWx5ICh1bnRpbCB3ZSBrbm93IHdoYXQgdG8gZG8sIHRvIHByZXZlbnQgYSBmbGFzaCBvZiB1bnN0eWxlZCBjb250ZW50KVxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICBzbG93QW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY29sb3IgPSBudWxsO1xuICB9LCAxMDAwKTtcblxuICAvLyBTZW5kIHRoZSB0ZXh0IHRvIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdFxuICBwb3J0LnBvc3RNZXNzYWdlKHtcbiAgICB0eXBlOiAnU0VORElORyBURVhUJyxcbiAgICB0ZXh0OiBwbGFpblRleHRcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRGcm9tVGV4dE9ubHlEb2N1bWVudCgpIHtcbiAgY29uc3QgYm9keUNoaWxkcmVuID0gZG9jdW1lbnQuYm9keS5jaGlsZE5vZGVzO1xuICBjb25zdCBmaXJzdENoaWxkID0gYm9keUNoaWxkcmVuWzBdO1xuXG4gIGNvbnN0IGJvZHlIYXNPbmx5T25lRWxlbWVudCA9IGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlcy5sZW5ndGggPT09IDE7XG4gIGNvbnN0IGlzUHJlID0gaXNQcmVFbGVtZW50KGZpcnN0Q2hpbGQpO1xuICBjb25zdCBpc1BsYWluVGV4dCA9IGlzUGxhaW5UZXh0RWxlbWVudChmaXJzdENoaWxkKTtcblxuICBpZiAoYm9keUhhc09ubHlPbmVFbGVtZW50ICYmIChpc1ByZSB8fCBpc1BsYWluVGV4dCkpIHtcbiAgICByZXR1cm4gZmlyc3RDaGlsZC5pbm5lclRleHQgfHwgZmlyc3RDaGlsZC5ub2RlVmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29udmVydFBsYWluVGV4dERvY3VtZW50VG9QcmVJZk5lZWRlZCgpIHtcbiAgaWYgKGlzUGxhaW5UZXh0RG9jdW1lbnQoKSkge1xuICAgIGNvbnN0IHBsYWluVGV4dE5vZGUgPSBkb2N1bWVudC5ib2R5LmNoaWxkTm9kZXNbMF07XG4gICAgY29uc3QgcHJlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIHByZUVsZW1lbnQuaW5uZXJUZXh0ID0gcGxhaW5UZXh0Tm9kZS5ub2RlVmFsdWU7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwcmVFbGVtZW50KTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHBsYWluVGV4dE5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5UZXh0RG9jdW1lbnQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5ib2R5LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxXG4gICAgJiYgaXNQbGFpblRleHRFbGVtZW50KGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJlRWxlbWVudChlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50LnRhZ05hbWUgPT09ICdQUkUnO1xufVxuXG5mdW5jdGlvbiBpc1BsYWluVGV4dEVsZW1lbnQoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREU7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCByZWFkeSwgZmFsc2UpO1xuXG5sZXQgbGFzdEtleVZhbHVlT3JWYWx1ZUlkR2l2ZW4gPSAwO1xuZnVuY3Rpb24gY29sbGFwc2UoZWxlbWVudHMpIHtcblxuICBmb3IgKGxldCBpID0gZWxlbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgYmxvY2tJbm5lciwgY291bnQ7XG4gICAgY29uc3QgZWwgPSBlbGVtZW50c1tpXTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdjb2xsYXBzZWQnKTtcblxuICAgIC8vIChDU1MgaGlkZXMgdGhlIGNvbnRlbnRzIGFuZCBzaG93cyBhbiBlbGxpcHNpcy4pXG5cbiAgICAvLyBBZGQgYSBjb3VudCBvZiB0aGUgbnVtYmVyIG9mIGNoaWxkIHByb3BlcnRpZXMvaXRlbXMgKGlmIG5vdCBhbHJlYWR5IGRvbmUgZm9yIHRoaXMgaXRlbSlcbiAgICBpZiAoIWVsLmlkKSB7XG4gICAgICBlbC5pZCA9IGBrZXlWYWx1ZU9yVmFsdWUkeysrbGFzdEtleVZhbHVlT3JWYWx1ZUlkR2l2ZW59YDtcblxuICAgICAgLy8gRmluZCB0aGUgYmxvY2tJbm5lclxuICAgICAgYmxvY2tJbm5lciA9IGVsLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgd2hpbGUgKGJsb2NrSW5uZXIgJiYgIWJsb2NrSW5uZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdibG9ja0lubmVyJykpIHtcbiAgICAgICAgYmxvY2tJbm5lciA9IGJsb2NrSW5uZXIubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgfVxuICAgICAgaWYgKCFibG9ja0lubmVyKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWUgaG93IG1hbnkgY2hpbGRyZW4gaW4gdGhlIGJsb2NrSW5uZXJcbiAgICAgIGNvdW50ID0gYmxvY2tJbm5lci5jaGlsZHJlbi5sZW5ndGg7XG5cbiAgICAgIC8vIEdlbmVyYXRlIGNvbW1lbnQgdGV4dCBlZyAnNCBpdGVtcydcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb3VudCArIChjb3VudCA9PT0gMSA/ICcgaXRlbScgOiAnIGl0ZW1zJyk7XG4gICAgICAvLyBBZGQgQ1NTIHRoYXQgdGFyZ2V0cyBpdFxuICAgICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdJTlNFUlQgQ1NTJyxcbiAgICAgICAgY29kZTogYCNrZXlWYWx1ZU9yVmFsdWUke2xhc3RLZXlWYWx1ZU9yVmFsdWVJZEdpdmVufS5jb2xsYXBzZWQ6YWZ0ZXJ7Y29udGVudDpcIiAvLyAke2NvbW1lbnR9XCJ9YFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4cGFuZChlbGVtZW50cykge1xuICBmb3IgKGxldCBpID0gZWxlbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKCdjb2xsYXBzZWQnKTtcbiAgfVxufVxuXG5jb25zdCBtYWMgPSBuYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZignTWFjJykgIT09IC0xO1xubGV0IG1vZEtleTtcbmlmIChtYWMpIHtcbiAgbW9kS2V5ID0gZnVuY3Rpb24oZXYpIHtcbiAgICByZXR1cm4gZXYubWV0YUtleTtcbiAgfTtcbn0gZWxzZSB7XG4gIG1vZEtleSA9IGZ1bmN0aW9uKGV2KSB7XG4gICAgcmV0dXJuIGV2LmN0cmxLZXk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdlbmVyYWxDbGljayhldikge1xuICBpZiAoZXYud2hpY2ggPT09IDEpIHtcbiAgICBjb25zdCBlbGVtID0gZXYudGFyZ2V0O1xuXG4gICAgaWYgKGVsZW0uY2xhc3NOYW1lID09PSAnZXhwYW5kZXInKSB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgICBjb25zdCBkaXYgPSBqZkNvbnRlbnQ7XG4gICAgICBjb25zdCBzY3JvbGxUb3AgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2NvbGxhcHNlZCcpKSB7XG4gICAgICAgIC8vIEVYUEFORFxuICAgICAgICBpZiAobW9kS2V5KGV2KSkge1xuICAgICAgICAgIGV4cGFuZChwYXJlbnQucGFyZW50Tm9kZS5jaGlsZHJlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwYW5kKFtwYXJlbnRdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ09MTEFQU0VcbiAgICAgICAgaWYgKG1vZEtleShldikpIHtcbiAgICAgICAgICBjb2xsYXBzZShwYXJlbnQucGFyZW50Tm9kZS5jaGlsZHJlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29sbGFwc2UoW3BhcmVudF0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc3RvcmUgc2Nyb2xsVG9wIHNvbWVob3dcbiAgICAgIC8vIENsZWFyIGN1cnJlbnQgZXh0cmEgbWFyZ2luLCBpZiBhbnlcbiAgICAgIGRpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAwO1xuXG4gICAgICAvLyBObyBuZWVkIHRvIHdvcnJ5IGlmIGFsbCBjb250ZW50IGZpdHMgaW4gdmlld3BvcnRcbiAgICAgIGlmIChkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCA8IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEFuZCBubyBuZWVkIHRvIHdvcnJ5IGlmIHNjcm9sbFRvcCBzdGlsbCB0aGUgc2FtZVxuICAgICAgaWYgKGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID09PSBzY3JvbGxUb3ApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgYm9keSBoYXMgZ290IGEgYml0IHNob3J0ZXIuXG4gICAgICAvLyBXZSBuZWVkIHRvIGluY3JlYXNlIHRoZSBib2R5IGhlaWdodCBieSBhIGJpdCAoYnkgaW5jcmVhc2luZyB0aGUgYm90dG9tIG1hcmdpbiBvbiB0aGUgamZDb250ZW50IGRpdikuIFRoZSBhbW91bnQgdG8gaW5jcmVhc2UgaXQgaXMgd2hhdGV2ZXIgaXMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvdXIgcHJldmlvdXMgc2Nyb2xsVG9wIGFuZCBvdXIgbmV3IG9uZS5cblxuICAgICAgLy8gV29yayBvdXQgaG93IG11Y2ggbW9yZSBvdXIgdGFyZ2V0IHNjcm9sbFRvcCBpcyB0aGFuIHRoaXMuXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gc2Nyb2xsVG9wIC0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyA4OyAvLyBpdCBhbHdheXMgbG9zZXMgOHB4OyBkb24ndCBrbm93IHdoeVxuXG4gICAgICAvLyBBZGQgdGhpcyBkaWZmZXJlbmNlIHRvIHRoZSBib3R0b20gbWFyZ2luXG4gICAgICBkaXYuc3R5bGUubWFyZ2luQm90dG9tID0gZGlmZmVyZW5jZSArICdweCc7XG5cbiAgICAgIC8vIE5vdyBjaGFuZ2UgdGhlIHNjcm9sbFRvcCBiYWNrIHRvIHdoYXQgaXQgd2FzXG4gICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2NvbnRlbnQuanMiLCJpbXBvcnQge3RoZW1lc30gZnJvbSAnLi90aGVtZXMnO1xuaW1wb3J0IHtjb25uZWN0fSBmcm9tIFwiLi9tZXNzYWdpbmdcIjtcblxuY29uc3QgdHJhbnNpdGlvblN0eWxlcyA9IHJlcXVpcmUoJy4uLy4uL3Nhc3MvdHJhbnNpdGlvbi5zY3NzJyk7XG5sZXQgcG9ydCwgdHJhbnNpdGlvblN0eWxlc0luamVjdDtcblxuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVRoZW1pbmcoKSB7XG4gIHBvcnQgPSBjb25uZWN0KCk7XG4gIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlKSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ1NUT1JFRCBUSEVNRScpIHtcbiAgICAgIHN3aXRjaFRvVGhlbWUobWVzc2FnZS50aGVtZU5hbWUpO1xuICAgIH1cbiAgfSk7XG4gIGluc2VydFRoZW1lT3B0aW9uQmFyKCk7XG59XG5cbmZ1bmN0aW9uIGluc2VydFRoZW1lT3B0aW9uQmFyKCkge1xuICBjb25zdCB0aGVtZUJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0aGVtZUJhci5pZCA9ICd0aGVtZU9wdGlvbkJhcic7XG4gIHRoZW1lQmFyLmNsYXNzTGlzdC5hZGQoJ29wdGlvbkJhcicpO1xuXG4gIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gIGxhYmVsLmlubmVyVGV4dCA9ICdUaGVtZTogJztcbiAgc2VsZWN0LmlkID0gJ3RoZW1lU2VsZWN0JztcbiAgc2VsZWN0LmlubmVySFRNTCA9IGdlbmVyYXRlT3B0aW9uc0hUTUwoKTtcblxuICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgIHBvcnQucG9zdE1lc3NhZ2Uoe3R5cGU6ICdVUERBVEUgU1RPUkVEIFRIRU1FJywgdGhlbWU6IHNlbGVjdC52YWx1ZX0pO1xuICAgIHNlbGVjdC5ibHVyKCk7XG4gIH0pO1xuXG4gIGxhYmVsLmFwcGVuZENoaWxkKHNlbGVjdCk7XG4gIHRoZW1lQmFyLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUodGhlbWVCYXIsIGRvY3VtZW50LmJvZHkuY2hpbGROb2Rlc1swXSk7XG4gIHBvcnQucG9zdE1lc3NhZ2Uoe3R5cGU6ICdHRVQgU1RPUkVEIFRIRU1FJ30pO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVtZVNlbGVjdCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aGVtZVNlbGVjdCcpO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVtZXNOZXN0ZWRCeVR5cGUoKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyh0aGVtZXMpLnJlZHVjZSgob3V0cHV0LCBrZXkpID0+IHtcbiAgICBjb25zdCB0aGVtZSA9IHRoZW1lc1trZXldO1xuICAgIGlmICh0eXBlb2YgdGhlbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBvdXRwdXRbdGhlbWUudHlwZV0gPSBvdXRwdXRbdGhlbWUudHlwZV0gfHwgW107XG4gICAgICBvdXRwdXRbdGhlbWUudHlwZV1ba2V5XSA9IHRoZW1lO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlT3B0aW9uc0hUTUwoKSB7XG4gIGNvbnN0IG5lc3RlZFRoZW1lcyA9IGdldFRoZW1lc05lc3RlZEJ5VHlwZSgpO1xuXG4gIHJldHVybiBPYmplY3Qua2V5cyhuZXN0ZWRUaGVtZXMpXG4gICAgLm1hcCgoZ3JvdXBOYW1lKSA9PiB7XG4gICAgICBjb25zdCB0aGVtZUdyb3VwID0gbmVzdGVkVGhlbWVzW2dyb3VwTmFtZV07XG4gICAgICBjb25zdCBncm91cE9wdGlvbnMgPSBPYmplY3Qua2V5cyh0aGVtZUdyb3VwKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICBjb25zdCB0aGVtZSA9IHRoZW1lR3JvdXBba2V5XTtcbiAgICAgICAgcmV0dXJuIGA8b3B0aW9uIHZhbHVlPVwiJHtrZXl9XCI+JHt0aGVtZS5uYW1lfTwvb3B0aW9uPmA7XG4gICAgICB9KS5qb2luKCcnKTtcblxuICAgICAgcmV0dXJuIGA8b3B0Z3JvdXAgbGFiZWw9XCIke2dyb3VwTmFtZX1cIj4ke2dyb3VwT3B0aW9uc308L29wdGdyb3VwPmA7XG4gICAgfSkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaFRvVGhlbWUodGhlbWVOYW1lKSB7XG4gIHRoZW1lTmFtZSA9IHRoZW1lc1t0aGVtZU5hbWVdID8gdGhlbWVOYW1lIDogdGhlbWVzLmRlZmF1bHQ7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gYHRoZW1lLSR7dGhlbWVOYW1lfWA7XG5cbiAgY29uc3QgdGhlbWVTZWxlY3QgPSBnZXRUaGVtZVNlbGVjdCgpO1xuICBjb25zdCB0aGVtZVNlbGVjdE9wdGlvbiA9IHRoZW1lU2VsZWN0ICYmIHRoZW1lU2VsZWN0LnF1ZXJ5U2VsZWN0b3IoYFt2YWx1ZT1cIiR7dGhlbWVOYW1lfVwiXWApO1xuICBpZiAodGhlbWVTZWxlY3RPcHRpb24pIHtcbiAgICB0aGVtZVNlbGVjdE9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gIH1cblxuICBpbnNlcnRUcmFuc2l0aW9uU3R5bGVzT25jZSgpO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRUcmFuc2l0aW9uU3R5bGVzT25jZSgpIHtcbiAgaWYgKCF0cmFuc2l0aW9uU3R5bGVzSW5qZWN0KSB7XG4gICAgdHJhbnNpdGlvblN0eWxlc0luamVjdCA9IHRydWU7XG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdJTlNFUlQgQ1NTJyxcbiAgICAgICAgY29kZTogdHJhbnNpdGlvblN0eWxlc1xuICAgICAgfSk7XG4gICAgfSwgMTAwMCk7XG4gIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9saWIvdGhlbWUtc3dpdGNoZXIuanMiLCJleHBvcnQgY29uc3QgdGhlbWVzID0ge1xuICBkZWZhdWx0OiAnZGF3bicsXG4gIGNocm9tZToge1xuICAgIG5hbWU6ICdDaHJvbWUnLFxuICAgIHR5cGU6ICdMaWdodCdcbiAgfSxcbiAgY2xvdWRzOiB7XG4gICAgbmFtZTogJ0Nsb3VkcycsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBjcmltc29uRWRpdG9yOiB7XG4gICAgbmFtZTogJ0NyaW1zb24gRWRpdG9yJyxcbiAgICB0eXBlOiAnTGlnaHQnXG4gIH0sXG4gIGRhd246IHtcbiAgICBuYW1lOiAnRGF3bicsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBkcmVhbXdlYXZlcjoge1xuICAgIG5hbWU6ICdEcmVhbXdlYXZlcicsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBlY2xpcHNlOiB7XG4gICAgbmFtZTogJ0VjbGlwc2UnLFxuICAgIHR5cGU6ICdMaWdodCdcbiAgfSxcbiAgZ2l0aHViOiB7XG4gICAgbmFtZTogJ0dpdEh1YicsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBpcGxhc3RpYzoge1xuICAgIG5hbWU6ICdpUGxhc3RpYycsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBrYXR6ZW5NaWxjaDoge1xuICAgIG5hbWU6ICdLYXR6ZW5NaWxjaCcsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBrdXJvaXI6IHtcbiAgICBuYW1lOiAnS3Vyb2lyJyxcbiAgICB0eXBlOiAnTGlnaHQnXG4gIH0sXG4gIHNvbGFyaXplZExpZ2h0OiB7XG4gICAgbmFtZTogJ1NvbGFyaXplZCBMaWdodCcsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBzcWxTZXJ2ZXI6IHtcbiAgICBuYW1lOiAnU1FMIFNlcnZlcicsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICB0ZXh0bWF0ZToge1xuICAgIG5hbWU6ICdUZXh0TWF0ZScsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICB0b21vcnJvdzoge1xuICAgIG5hbWU6ICdUb21vcnJvdycsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICB4Y29kZToge1xuICAgIG5hbWU6ICdYQ29kZScsXG4gICAgdHlwZTogJ0xpZ2h0J1xuICB9LFxuICBhbWJpYW5jZToge1xuICAgIG5hbWU6ICdBbWJpYW5jZScsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIGNoYW9zOiB7XG4gICAgbmFtZTogJ0NoYW9zJyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfSxcbiAgY2xvdWRzTWlkbmlnaHQ6IHtcbiAgICBuYW1lOiAnQ2xvdWRzIE1pZG5pZ2h0JyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfSxcbiAgY29iYWx0OiB7XG4gICAgbmFtZTogJ0NvYmFsdCcsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIGdvYjoge1xuICAgIG5hbWU6ICdHb2InLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICBncnV2Ym94OiB7XG4gICAgbmFtZTogJ0dydXZib3gnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICBpZGxlRmluZ2Vyczoge1xuICAgIG5hbWU6ICdpZGxlIEZpbmdlcnMnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICBrclRoZW1lOiB7XG4gICAgbmFtZTogJ2tyVGhlbWUnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICBtZXJiaXZvcmU6IHtcbiAgICBuYW1lOiAnTWVyYml2b3JlJyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfSxcbiAgbWVyYml2b3JlU29mdDoge1xuICAgIG5hbWU6ICdNZXJiaXZvcmUgU29mdCcsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIG1vbm9JbmR1c3RyaWFsOiB7XG4gICAgbmFtZTogJ01vbm8gSW5kdXN0cmlhbCcsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIG1vbm9rYWk6IHtcbiAgICBuYW1lOiAnTW9ub2thaScsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIHBhc3RlbE9uRGFyazoge1xuICAgIG5hbWU6ICdQYXN0ZWwgb24gZGFyaycsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIHNvbGFyaXplZERhcms6IHtcbiAgICBuYW1lOiAnU29sYXJpemVkIERhcmsnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICB0ZXJtaW5hbDoge1xuICAgIG5hbWU6ICdUZXJtaW5hbCcsXG4gICAgdHlwZTogJ0RhcmsnXG4gIH0sXG4gIHRvbW9ycm93TmlnaHQ6IHtcbiAgICBuYW1lOiAnVG9tb3Jyb3cgTmlnaHQnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICB0b21vcnJvd05pZ2h0Qmx1ZToge1xuICAgIG5hbWU6ICdUb21vcnJvdyBOaWdodCBCbHVlJyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfSxcbiAgdG9tb3Jyb3dOaWdodEJyaWdodDoge1xuICAgIG5hbWU6ICdUb21vcnJvdyBOaWdodCBCcmlnaHQnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICB0b21vcnJvd05pZ2h0RWlnaHRpZXM6IHtcbiAgICBuYW1lOiAnVG9tb3Jyb3cgTmlnaHQg4oCZODBzJyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfSxcbiAgdHdpbGlnaHQ6IHtcbiAgICBuYW1lOiAnVHdpbGlnaHQnLFxuICAgIHR5cGU6ICdEYXJrJ1xuICB9LFxuICB2aWJyYW50SW5rOiB7XG4gICAgbmFtZTogJ1ZpYnJhbnQgSW5rJyxcbiAgICB0eXBlOiAnRGFyaydcbiAgfVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9saWIvdGhlbWVzLmpzIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJib2R5e3RyYW5zaXRpb24tcHJvcGVydHk6YmFja2dyb3VuZC1jb2xvcixjb2xvcjt0cmFuc2l0aW9uLWR1cmF0aW9uOi41czt0cmFuc2l0aW9uLWRlbGF5OjBzO3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOmN1YmljLWJlemllciguMjE1LC42MSwuMzU1LDEpfTo6LW1vei1zZWxlY3Rpb257dHJhbnNpdGlvbi1wcm9wZXJ0eTpiYWNrZ3JvdW5kLWNvbG9yLGNvbG9yO3RyYW5zaXRpb24tZHVyYXRpb246LjVzO3RyYW5zaXRpb24tZGVsYXk6MHM7dHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246Y3ViaWMtYmV6aWVyKC4yMTUsLjYxLC4zNTUsMSl9OjpzZWxlY3Rpb257dHJhbnNpdGlvbi1wcm9wZXJ0eTpiYWNrZ3JvdW5kLWNvbG9yLGNvbG9yO3RyYW5zaXRpb24tZHVyYXRpb246LjVzO3RyYW5zaXRpb24tZGVsYXk6MHM7dHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246Y3ViaWMtYmV6aWVyKC4yMTUsLjYxLC4zNTUsMSl9I2d1dHRlciwuYm9vbCwuYnJhY2UsLmNvbGxhcHNlZDphZnRlciwua2V5LC5udWxsLC5udW1iZXIsLnN0cmluZyxbbGluZS1udW1iZXJdOmJlZm9yZXt0cmFuc2l0aW9uLXByb3BlcnR5OmJhY2tncm91bmQtY29sb3IsY29sb3I7dHJhbnNpdGlvbi1kdXJhdGlvbjouNXM7dHJhbnNpdGlvbi1kZWxheTowczt0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjpjdWJpYy1iZXppZXIoLjIxNSwuNjEsLjM1NSwxKX1cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlcj9pbXBvcnRMb2FkZXJzPTEhLi9+L3Bvc3Rjc3MtbG9hZGVyIS4vfi9zYXNzLWxvYWRlci9saWIvbG9hZGVyLmpzP291dHB1dFN0eWxlPWNvbXByZXNzZWQhLi9zcmMvc2Fzcy90cmFuc2l0aW9uLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDMxXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBnZXQgcnVudGltZSgpIHtcbiAgICByZXR1cm4gZ2V0QnJvd3NlcigpLnJ1bnRpbWU7XG4gIH0sXG4gIGdldCBzdG9yYWdlKCkge1xuICAgIHJldHVybiBnZXRCcm93c2VyKCkuc3RvcmFnZTtcbiAgfSxcbiAgZ2V0IHRhYnMoKSB7XG4gICAgcmV0dXJuIGdldEJyb3dzZXIoKS50YWJzO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRCcm93c2VyKCkge1xuICByZXR1cm4gdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6IGNocm9tZTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9saWIvYnJvd3Nlci5qcyIsIlxuICAgICAgICB2YXIgcmVzdWx0ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanM/aW1wb3J0TG9hZGVycz0xIS4uLy4uL25vZGVfbW9kdWxlcy9wb3N0Y3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvbGliL2xvYWRlci5qcz9vdXRwdXRTdHlsZT1jb21wcmVzc2VkIS4vdHJhbnNpdGlvbi5zY3NzXCIpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZHVsZS5leHBvcnRzID0gcmVzdWx0LnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zYXNzL3RyYW5zaXRpb24uc2Nzc1xuLy8gbW9kdWxlIGlkID0gNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiaW1wb3J0IGJyb3dzZXIgZnJvbSAnLi9icm93c2VyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3QoKSB7XG4gIHJldHVybiBicm93c2VyLnJ1bnRpbWUuY29ubmVjdCh7bmFtZTogJ2pmJ30pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuKG9uTWVzc2FnZVJlY2VpdmVkKSB7XG4gIGJyb3dzZXIucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoKHBvcnQpID0+IHtcbiAgICBpZiAocG9ydC5uYW1lICE9PSAnamYnKSB7XG4gICAgICBjb25zb2xlLmxvZyhgSlNPTiBGb3JtYXR0ZXIgZXJyb3IgLSB1bmtub3duIHBvcnQgbmFtZSAke3BvcnQubmFtZX1gLCBwb3J0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigoLi4uYXJncykgPT4gb25NZXNzYWdlUmVjZWl2ZWQocG9ydCwgLi4uYXJncykpO1xuICB9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9saWIvbWVzc2FnaW5nLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==