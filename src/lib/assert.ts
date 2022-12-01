const prefix = 'Runtime assertion failed'

/** Assertion that runs at runtime and hints to TypeScript that `condition` is truthy. */
export function assert(
  condition: any,
  message?: string | (() => string)
): asserts condition {
  if (condition) return

  const providedMessage = typeof message === 'function' ? message() : message

  const finalMessage = providedMessage
    ? ''.concat(prefix, ': ').concat(providedMessage)
    : prefix

  throw new Error(finalMessage)
}
