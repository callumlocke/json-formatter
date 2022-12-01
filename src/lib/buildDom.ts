import {
  TYPE_ARRAY,
  TYPE_BOOL,
  TYPE_NULL,
  TYPE_NUMBER,
  TYPE_OBJECT,
  TYPE_STRING,
} from './constants'
import { assert } from './assert'
import { getValueType } from './getValueType'
import { createBlankSpan, templates } from './templates'
import { JsonValue } from './types'

/**
 * Recursively builds a style-able DOM tree of nested spans, based on a JSON value (or key-value pair).
 *
 * If a string `keyName` is provided, the output span represents full object entry (a key-value pair). Otherwise the output span just represents a simple value.
 *
 * If the passed value is an object property (as when this fn is called recursively), the returned DOM tree includes the key you pass in.
 *
 * @param value Any JSON-compatible value (object, array, or primitive)
 * @param keyName The key for this value if it's an object entry, or `false` if it's not
 * @returns The generated DOM tree
 */

export const buildDom = (
  value: JsonValue,
  keyName: string | false
): HTMLSpanElement => {
  // Establish what type this value is
  const type = getValueType(value)

  // Create root node for this entry
  const entry = templates.t_entry.cloneNode(false) as HTMLSpanElement

  // Establish the size (number of entries) if it's an object or array
  let collectionSize = 0
  if (type === TYPE_OBJECT) {
    // @ts-ignore
    collectionSize = Object.keys(value).length
  } else if (type === TYPE_ARRAY) {
    // @ts-ignore
    collectionSize = value.length
  }

  // Establish if this is an array/object with non-zero size, and add an expander button if so
  let nonZeroSize = false
  if (type === TYPE_OBJECT || type === TYPE_ARRAY) {
    // @ts-ignore - TODO
    for (const objKey in value) {
      // @ts-ignore - TODO
      if (value.hasOwnProperty(objKey)) {
        nonZeroSize = true
        break // no need to keep counting; only need one
      }
    }
    if (nonZeroSize) entry.appendChild(templates.t_exp.cloneNode(false))
  }

  // If there's a key, add that before the value
  if (keyName !== false) {
    // NB: "" is a legal keyname in JSON
    // This entry must be an object property
    entry.classList.add('objProp')

    // Create a span for the key name
    const keySpan = templates.t_key.cloneNode(false)
    keySpan.textContent = JSON.stringify(keyName).slice(1, -1) // remove quotes

    // Add it to entry, with quote marks
    entry.appendChild(templates.t_dblqText.cloneNode(false))
    entry.appendChild(keySpan)
    entry.appendChild(templates.t_dblqText.cloneNode(false))

    // Also add ":&nbsp;" (colon and non-breaking space)
    entry.appendChild(templates.t_colonAndSpace.cloneNode(false))
  } else {
    // This is an array element instead
    entry.classList.add('arrElem')
  }

  // Generate DOM for this value
  let blockInner: HTMLSpanElement
  let childEntry: HTMLSpanElement

  switch (type) {
    case TYPE_STRING: {
      assert(typeof value === 'string')

      // If string is a URL, get a link, otherwise get a span
      const innerStringEl = createBlankSpan()

      let escapedString = JSON.stringify(value)
      escapedString = escapedString.substring(1, escapedString.length - 1) // remove outer quotes

      if (
        value.substring(0, 8) === 'https://' ||
        value.substring(0, 7) === 'http://' ||
        value[0] === '/'
      ) {
        const innerStringA = document.createElement('a')
        innerStringA.href = value
        innerStringA.innerText = escapedString
        innerStringEl.appendChild(innerStringA)
      } else {
        innerStringEl.innerText = escapedString
      }
      const valueElement = templates.t_string.cloneNode(false)
      valueElement.appendChild(templates.t_dblqText.cloneNode(false))
      valueElement.appendChild(innerStringEl)
      valueElement.appendChild(templates.t_dblqText.cloneNode(false))
      entry.appendChild(valueElement)
      break
    }

    case TYPE_NUMBER: {
      // Simply add a number element (span.n)
      const valueElement = templates.t_number.cloneNode(
        false
      ) as HTMLSpanElement
      valueElement.innerText = String(value)
      entry.appendChild(valueElement)
      break
    }

    case TYPE_OBJECT: {
      assert(typeof value === 'object')

      // Add opening brace
      entry.appendChild(templates.t_oBrace.cloneNode(true))

      // If any properties, add a blockInner containing k/v pair(s)
      if (nonZeroSize) {
        // Add ellipsis (empty, but will be made to do something when entry is collapsed)
        entry.appendChild(templates.t_ellipsis.cloneNode(false))
        // Create blockInner, which indents (don't attach yet)
        blockInner = templates.t_blockInner.cloneNode(false) as HTMLSpanElement
        // For each key/value pair, add as a entry to blockInner

        let lastComma
        for (let k in value) {
          if (value.hasOwnProperty(k)) {
            // count++
            // @ts-ignore - TODO
            childEntry = buildDom(value[k], k)

            // Add comma (before sizeComment if present, otherwise at end)
            const comma = templates.t_commaText.cloneNode()

            childEntry.appendChild(comma)

            blockInner.appendChild(childEntry)

            lastComma = comma
          }
        }

        // Now remove the last comma
        assert(
          // @ts-ignore
          typeof childEntry !== 'undefined' && typeof lastComma !== 'undefined'
        )
        childEntry.removeChild(lastComma)

        // Add blockInner
        entry.appendChild(blockInner)
      }

      // Add closing brace
      entry.appendChild(templates.t_cBrace.cloneNode(true))

      // Add data attribute to indicate size
      entry.dataset.size = ` // ${collectionSize} ${
        collectionSize === 1 ? 'item' : 'items'
      }`

      break
    }

    case TYPE_ARRAY: {
      assert(Array.isArray(value))

      // Add opening bracket
      entry.appendChild(templates.t_oBracket.cloneNode(true))

      // Unless it's empty, add blockInner containing inner vals
      if (nonZeroSize) {
        // Add ellipsis
        entry.appendChild(templates.t_ellipsis.cloneNode(false))

        // Create blockInner (which indents) (don't attach yet)
        blockInner = templates.t_blockInner.cloneNode(false) as HTMLSpanElement

        // For each key/value pair, add the markup
        for (
          let i = 0, length = value.length, lastIndex = length - 1;
          i < length;
          i++
        ) {
          childEntry = buildDom(value[i], false)

          // If not last one, add comma
          if (i < lastIndex) {
            const comma = templates.t_commaText.cloneNode()
            childEntry.appendChild(comma)
          }

          blockInner.appendChild(childEntry)
        }
        // Add blockInner
        entry.appendChild(blockInner)
      }
      // Add closing bracket
      entry.appendChild(templates.t_cBracket.cloneNode(true))

      // Add data attribute to indicate size
      entry.dataset.size = ` // ${collectionSize} ${
        collectionSize === 1 ? 'item' : 'items'
      }`

      break
    }

    case TYPE_BOOL: {
      if (value) entry.appendChild(templates.t_true.cloneNode(true))
      else entry.appendChild(templates.t_false.cloneNode(true))
      break
    }

    case TYPE_NULL: {
      entry.appendChild(templates.t_null.cloneNode(true))
      break
    }
  }

  return entry
}
