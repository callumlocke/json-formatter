import type { Prettify } from '../../../lib/types'
import { once } from '../../lib/once'

type DomInfo =
  | {
      isTextPage: true
      pre: HTMLPreElement
      bodyChildren: HTMLElement[]

      /** This will also be in siblings, included here separately for convenience */
      chromeJfc: HTMLDivElement | null
    }
  | { isTextPage: false | null; note: string }

const scanDom = (): DomInfo => {
  let pre: HTMLPreElement | null = null
  let chromeJfc: HTMLDivElement | null = null

  const bodyChildrenCollection = document.body.children
  const length = bodyChildrenCollection.length
  const bodyChildren: HTMLElement[] = []
  for (let i = 0; i < length; i++) {
    const child = bodyChildrenCollection[i] as HTMLElement

    bodyChildren[i] = child

    switch (child.tagName) {
      case 'PRE': {
        if (pre != null)
          return { isTextPage: false, note: 'Multiple body > pre elements' }
        pre = child as HTMLPreElement
        break
      }

      // common textual elements likely indicate a false positive if used at root level - a prototype HTML page that just happens to include a single body>pre. Presence of divs/structural elements is not checked as it may be written by other extensions.
      case 'P':
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
      case 'UL':
      case 'OL':
        return {
          isTextPage: false,
          note: 'body contains textual elements',
        }

      default:
      // siblings.push(child)
    }

    // if (child.className === 'json-formatter-container')
    //   chromeJfc = child as HTMLDivElement
  }

  if (pre == null) return { isTextPage: false, note: 'No body > pre' }

  if (pre.checkVisibility?.() === false)
    return {
      isTextPage: false,
      note: 'body > pre is not rendered',
    }

  return {
    isTextPage: true,
    pre,
    chromeJfc,
    bodyChildren,
  }
}

const getDocHint = () => {
  const { contentType } = document
  if (!contentType) return 'EMPTY'
  switch (contentType) {
    case 'text/html':
    case 'application/html':
      return 'HTML'
    case 'application/json':
    case 'text/json':
      return 'JSON'
    default:
      if (/application\/\^(\b)+\+json/.test(contentType)) return 'JSON'
  }
  return 'OTHER'
}

type DocInfo = Prettify<DomInfo & { docHint?: ReturnType<typeof getDocHint> }>

/**
 * Inspects document to see if it [might be] meant as JSON (either served with a JSON-ish MIME type, or an extensionless `file:` or an HTTP response with no `content-type` header). Prioritises returning as fast as possible for 99.999% of non-JSON pages to minimise browsing impact.
 *
 * Returned properties include:
 * - `docHint` - e.g. `'JSON'`, derived from `document.contentType` (which is not always available)
 * - `isTextPage`: whether body structure indicates a text page
 *
 * If `isTextPage` is `true` you also get:
 * - `pre` including possible JSON in `.textContent`
 * - `siblings` - any other divs etc found in body children
 * - `chromeJfc` - pointer to Chrome's `body>div.json-formatter-container` if spotted (will also be in siblings)
 */

export const getDocInfo: () => DocInfo = once((): DocInfo => {
  if (document.title)
    return {
      isTextPage: null,
      note: 'document.title has content',
    }

  // See what document.contentType indicates about the page type
  // const { contentType: docContentType } = document
  const docHint = getDocHint()

  // If it could be JSON, scan DOM structure
  switch (docHint) {
    case 'JSON':
    case 'OTHER':
    case 'EMPTY': {
      return { docHint, ...scanDom() }
    }
  }

  return {
    docHint,
    isTextPage: null,
    note: 'Could not determine',
  }
})
