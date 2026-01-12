let singleton: Promise<void>

/** Returns a promise that resolves when the DOM is loaded (resolves immediately if already loaded). */
export const whenDomLoaded = () => {
  if (!singleton)
    singleton = new Promise<void>((resolve) => {
      const { readyState } = document
      if (readyState === 'interactive' || readyState === 'complete') resolve()
      else
        document.addEventListener('DOMContentLoaded', () => resolve(), {
          once: true,
        })
    })

  return singleton
}
