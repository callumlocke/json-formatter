import type { JsonValue } from './types.ts'

export const MAX_LENGTH = 3_000_000

export type Result =
  | { formatted: true, note: string, rawLength: number, element: HTMLPreElement, parsed: JsonValue }
  | { formatted: false, note: string, rawLength: number | null }

export function getResult(document = globalThis.document): Result {
  if (document.title)
    return { formatted: false, note: 'document.title is contentful', rawLength: null }

  let pre: HTMLPreElement | null = null
  const bodyChildren = document.body.children
  const length = bodyChildren.length
  for (let i = 0; i < length; i++) {
    const child = bodyChildren[i]

    switch (child.tagName) {
      case 'PRE': {
        if (pre != null)
          return { formatted: false, note: 'Multiple body > pre elements', rawLength: null }
        pre = child as HTMLPreElement
        break
      }
      case 'P':
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6': {
        return { formatted: false, note: 'body contains textual elements', rawLength: null }
      }
    }
  }

  if (pre == null)
    return { formatted: false, note: 'No body > pre', rawLength: null }
  if (pre.checkVisibility?.() === false)
    return { formatted: false, note: 'body > pre is not rendered', rawLength: null }

  const rawPreContent = pre.textContent
  const rawLength = rawPreContent.length

  if (!rawPreContent)
    return { formatted: false, note: 'No content in body > pre', rawLength }

  if (rawLength > MAX_LENGTH)
    return { formatted: false, note: 'Too long', rawLength }
  if (!/^\s*[\{\[]/.test(rawPreContent))
    return { formatted: false, note: 'Does not start with { or ]', rawLength }

  // Status: probably JSON, and acceptable length.
  // Try to parse as JSON
  let parsed: JsonValue
  try {
    parsed = JSON.parse(rawPreContent)
  } catch (e) {
    return { formatted: false, note: 'Does not parse as JSON', rawLength }
  }

  if (typeof parsed !== 'object') {
    // should be unreachable anyway due to checking /^\s*[\{\[]/ match above
    return { formatted: false, note: 'Technically JSON but not an object or array', rawLength }
  }

  return { formatted: true, note: 'done', element: pre, rawLength, parsed }
}
