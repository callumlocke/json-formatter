'use strict';

import { createSpan, Templates } from './template';

const TOKEN_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  BOOL: 'BOOL',
  NULL: 'NULL',
};

let lineNumber;

export function jsonObjectToHTML(obj, jsonpFunctionName) {
  // Format object (using recursive keyValueOrValue builder)
  lineNumber = jsonpFunctionName === null ? 1 : 2;
  const rootKeyValueOrValue = getKeyValueOrValueDom(obj, false);

  // The whole DOM is now built.

  // Set class on root node to identify it
  rootKeyValueOrValue.classList.add('rootKeyValueOrValue');

  const gutterWidth = 1 + (lineNumber.toString().length * 0.5) + 'rem';
  const gutter = document.createElement('div');
  gutter.id = 'gutter';
  gutter.style.width = gutterWidth;

  // Make div#formattedJson and append the root keyValueOrValue
  const divFormattedJson = document.createElement('div');
  divFormattedJson.id = 'formattedJson';
  divFormattedJson.style.marginLeft = gutterWidth;
  divFormattedJson.appendChild(rootKeyValueOrValue);

  // Top and tail with JSONP padding if necessary
  if (jsonpFunctionName !== null) {
    divFormattedJson.innerHTML =
      `<div id="jsonpOpener" line-number="1">${jsonpFunctionName}(</div>
         ${divFormattedJson.innerHTML}
       <div id="jsonpCloser" line-number="${lineNumber}">)</div>`;
  }

  // Return the HTML
  return gutter.outerHTML + divFormattedJson.outerHTML;
}

// Core recursive DOM-building function
function getKeyValueOrValueDom(value, keyName) {
  const templates = Templates;
  let type, nonZeroSize;

  // Establish value type
  if (typeof value === 'string') {
    type = TOKEN_TYPES.STRING;
  } else if (typeof value === 'number') {
    type = TOKEN_TYPES.NUMBER;
  } else if (value === false || value === true) {
    type = TOKEN_TYPES.BOOL;
  } else if (value === null) {
    type = TOKEN_TYPES.NULL;
  } else if (value instanceof Array) {
    type = TOKEN_TYPES.ARRAY;
  } else {
    type = TOKEN_TYPES.OBJECT;
  }

  // Root node for this keyValueOrValue
  const keyValueOrValue = templates.keyValueOrValue();
  keyValueOrValue.setAttribute('line-number', lineNumber++);

  // Add an 'expander' first (if this is object/array with non-zero size)
  if (type === TOKEN_TYPES.OBJECT || type === TOKEN_TYPES.ARRAY) {
    nonZeroSize = Object.keys(value).some((key) => value.hasOwnProperty(key));

    if (nonZeroSize) {
      keyValueOrValue.appendChild(templates.expander());
    }
  }

  // If there's a key, add that before the value
  if (keyName !== false) { // NB: "" is a legal keyname in JSON
    // This keyValueOrValue must be an object property
    keyValueOrValue.classList.add('objectProperty');
    // Create a span for the key name
    const keySpan = templates.key();
    keySpan.textContent = JSON.stringify(keyName);
    keyValueOrValue.appendChild(keySpan);
    // Also add ":&nbsp;" (colon and non-breaking space)
    keyValueOrValue.appendChild(templates.colonAndSpace());
  }
  else {
    // This is an array element instead
    keyValueOrValue.classList.add('arrayElement');
  }

  // Generate DOM for this value
  let blockInner, childKeyValueOrValue, valueElement;
  switch (type) {
    case TOKEN_TYPES.STRING:
      // If string is a URL, get a link, otherwise get a span
      const innerStringEl = createSpan();
      let escapedString = JSON.stringify(value);
      escapedString = escapedString.substring(1, escapedString.length - 1); // remove quotes
      if (value[0] === 'h' && value.substring(0, 4) === 'http') { // crude but fast - some false positives, but rare, and UX doesn't suffer terribly from them.
        const innerStringA = document.createElement('A');
        innerStringA.href = value;
        innerStringA.innerText = escapedString;
        innerStringEl.appendChild(innerStringA);
      }
      else {
        innerStringEl.innerText = escapedString;
      }
      valueElement = templates.string();
      valueElement.appendChild(templates.doubleQuoteText());
      valueElement.appendChild(innerStringEl);
      valueElement.appendChild(templates.doubleQuoteText());
      keyValueOrValue.appendChild(valueElement);
      break;

    case TOKEN_TYPES.NUMBER:
      // Simply add a number element (span.n)
      valueElement = templates.number();
      valueElement.innerText = value;
      keyValueOrValue.appendChild(valueElement);
      break;

    case TOKEN_TYPES.OBJECT:
      // Add opening brace
      keyValueOrValue.appendChild(templates.openingBrace());
      // If any properties, add a blockInner containing k/v pair(s)
      if (nonZeroSize) {
        // Add ellipsis (empty, but will be made to do something when keyValueOrValue is collapsed)
        keyValueOrValue.appendChild(templates.ellipsis());
        // Create blockInner, which indents (don't attach yet)
        blockInner = templates.blockInner();
        // For each key/value pair, add as a keyValueOrValue to blockInner
        let count = 0, comma;
        for (let k in value) {
          if (value.hasOwnProperty(k)) {
            count++;
            childKeyValueOrValue = getKeyValueOrValueDom(value[k], k);
            // Add comma
            comma = templates.commaText();
            childKeyValueOrValue.appendChild(comma);
            blockInner.appendChild(childKeyValueOrValue);
          }
        }
        // Now remove the last comma
        childKeyValueOrValue.removeChild(comma);
        // Add blockInner
        keyValueOrValue.appendChild(blockInner);
      }

      // Add closing brace
      const closingBrace = templates.closingBrace();
      keyValueOrValue.appendChild(closingBrace);
      if (nonZeroSize) {
        closingBrace.setAttribute('line-number', lineNumber++);
      }
      break;

    case TOKEN_TYPES.ARRAY:
      // Add opening bracket
      keyValueOrValue.appendChild(templates.openingBracket());
      // If non-zero length array, add blockInner containing inner vals
      if (nonZeroSize) {
        // Add ellipsis
        keyValueOrValue.appendChild(templates.ellipsis());
        // Create blockInner (which indents) (don't attach yet)
        blockInner = templates.blockInner();
        // For each key/value pair, add the markup
        for (let i = 0, length = value.length, lastIndex = length - 1; i < length; i++) {
          // Make a new keyValueOrValue, with no key
          childKeyValueOrValue = getKeyValueOrValueDom(value[i], false);
          // Add comma if not last one
          if (i < lastIndex) {
            childKeyValueOrValue.appendChild(templates.commaText());
          }
          // Append the child keyValueOrValue
          blockInner.appendChild(childKeyValueOrValue);
        }
        // Add blockInner
        keyValueOrValue.appendChild(blockInner);
      }
      // Add closing bracket
      const closingBracket = templates.closingBracket();
      keyValueOrValue.appendChild(closingBracket);
      if (nonZeroSize) {
        closingBracket.setAttribute('line-number', lineNumber++);
      }
      break;

    case TOKEN_TYPES.BOOL:
      if (value) {
        keyValueOrValue.appendChild(templates.true);
      } else {
        keyValueOrValue.appendChild(templates.false());
      }
      break;

    case TOKEN_TYPES.NULL:
      keyValueOrValue.appendChild(templates.null());
      break;
  }

  return keyValueOrValue;
}
