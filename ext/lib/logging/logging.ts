import { DEV, JF_CONTEXT } from '../config.browser'
import { sendMessage } from '../messaging/messaging'

type Logger = <P extends unknown>(message: string, payload?: P) => void

const _logLocal: Logger = (message, payload) => {
  console.log(`🌐: ${message}`, payload)
}

const _logGlobal: Logger = (message, payload) => {
  if (JF_CONTEXT === 'worker/worker') _logLocal(message, payload)
  else sendMessage('JF_GLOBAL_LOG', { message, payload })
}

/** Logs to the local context's console (whether worker, content script, or page). Stripped out in production builds. */
export const logLocal: Logger = DEV ? _logLocal : () => {}

/** Logs to the global log (handled by worker) from any context. Stripped out in production builds. */
export const logGlobal: Logger = DEV ? _logGlobal : () => {}

export const logLocal_keepInProd = _logLocal
export const logGlobal_keepInProd = _logGlobal
