import type { JfContext } from '../../../lib/types'
import type { TabResponseInfo } from '../../worker/tabResponseCache'

export type MessageProtocol = {
  /** For logging to the background worker's console. */
  JF_GLOBAL_LOG: {
    from: 'content/core' | 'options/options'
    to: 'worker/worker'
    payload: { message: string; payload?: unknown }
    response: void
  }

  JF_GET_RESPONSE_INFO: {
    from: 'content/core'
    to: 'worker/worker'
    payload: {}
    response:
      | {
          success: true
          responseInfo: TabResponseInfo
        }
      | { success: false }
  }
}

// validate type
const _validate = {} as MessageProtocol satisfies Record<
  string,
  {
    from: JfContext
    to: JfContext
    payload: unknown
    response: unknown
  }
>
