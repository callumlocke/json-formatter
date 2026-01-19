import invariant from 'tiny-invariant'
import type { JfContext } from '../../lib/types'

// @ts-ignore - building ext/content/tsconfig.json fails
const NODE_ENV = process.env.NODE_ENV
export const DEV = NODE_ENV === 'development'
export const MAX_LENGTH = 3_000_000

// $VARS are replaced via `define` option on `Bun.build`
export const PERFMARKS = // @ts-expect-error
  $PERFMARKS as boolean

export const JF_CONTEXT: JfContext =
  // @ts-expect-error
  globalThis['__jf_context']

// Validate JF_CONTEXT
if (DEV) {
  switch (JF_CONTEXT) {
    case 'content/core':
    case 'content/console':
    case 'worker/worker':
    case 'options/options':
      break
    default:
      invariant(
        JF_CONTEXT,
        `Unexpected value for globalThis.__jf_context: ${JF_CONTEXT}`,
      )
  }
}
