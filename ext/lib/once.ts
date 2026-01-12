/**
 * Wraps a function to ensure it is only executed once.
 * Subsequent calls return the cached result of the first execution.
 */
export const once = <T>(fn: () => T) => {
  let called = false
  let result: T

  return (): T => {
    if (!called) {
      result = fn()
      called = true
    }
    return result
  }
}
