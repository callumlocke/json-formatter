import type { Prettify } from '../../../lib/types'
import { logLocal } from '../logging/logging'
import type { MessageProtocol } from './protocol'
import browser from 'webextension-polyfill'

type MessageType = Prettify<keyof MessageProtocol>

// Wrapper ensures messages sent over the wire always have a type identifier
interface InternalMessagePacket<K extends MessageType> {
  type: K
  payload: MessageProtocol[K]['payload']
}

// Handler function type definition
type RequestHandler<K extends MessageType> = (
  payload: MessageProtocol[K]['payload'],
  sender: browser.Runtime.MessageSender,
) => Promise<MessageProtocol[K]['response']> | MessageProtocol[K]['response']

/**
 * Sends a typed message to the background or other extension parts.
 *
 * @param type - The message ID defined in MessageProtocol
 * @param payload - The payload matching the message ID (optional if void)
 * @returns Promise for the response type
 */
export function sendMessage<K extends MessageType>(
  type: K,
  payload: MessageProtocol[K]['payload'],
): Promise<MessageProtocol[K]['response']> {
  return new Promise((resolve, reject) => {
    // console.log('SENDMESSAGE', type, payload)

    const message: InternalMessagePacket<K> = { type, payload }

    try {
      browser.runtime.sendMessage(message).then((response) => {
        // Handle Chrome internal errors (e.g., receiver does not exist)
        if (browser.runtime.lastError) {
          logLocal('sendMessage failed', browser.runtime.lastError)
          reject(new Error(browser.runtime.lastError.message))
          return
        }
        resolve(response as MessageProtocol[K]['response']) // TODO
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Registers a listener for a specific message type.
 * Automatically handles async responses (returning true) for you.
 *
 * @param type - The message ID to listen for
 * @param handler - A function (sync or async) that returns the expected response
 * @returns A cleanup function to remove the listener
 */
export function onMessage<K extends MessageType>(
  type: K,
  handler: RequestHandler<K>,
): () => void {
  const listener: browser.Runtime.OnMessageListener = (
    message: unknown,
    sender: browser.Runtime.MessageSender,
  ) => {
    // 1. Check if this message is meant for this handler
    if (
      typeof message === 'object' &&
      message !== null &&
      'type' in message &&
      message.type === type
    ) {
      const typedMessage = message as InternalMessagePacket<K>

      return handler(typedMessage.payload, sender)
    }
  }

  browser.runtime.onMessage.addListener(listener)

  return () => browser.runtime.onMessage.removeListener(listener)
}
