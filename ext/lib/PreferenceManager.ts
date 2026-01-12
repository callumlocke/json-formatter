import browser from 'webextension-polyfill'
import { logGlobal } from './logging/logging'

/**
 * A function that returns true if the value matches type T.
 */
export type Validator<T> = (value: unknown) => boolean

/**
 * definition container for an option.
 */
export interface StorageSetting<T> {
  defaultValue: T
  validate: Validator<T>
}

/**
 * defineSetting helper.
 * We put defaultValue first to help TypeScript infer T automatically.
 * You can pass an explicit generic if you need to narrow types (e.g. unions).
 */
export function defineSetting<T>(
  defaultValue: T,
  validate: Validator<T>,
): StorageSetting<T> {
  return { defaultValue, validate }
}

/**
 * Utility to extract the resulting shape from the schema object.
 */
export type InferSchema<S> = {
  [K in keyof S]: S[K] extends StorageSetting<infer T> ? T : never
}

/**
 * Preference Manager
 */
export class PreferenceManager<
  Schema extends Record<string, StorageSetting<any>>,
  PrefsType = InferSchema<Schema>,
  PrefsChangeListener = (change: {
    oldValue: any
    newValue: PrefsType | void
  }) => void,
> {
  private changeListeners = new Set<PrefsChangeListener>()

  private changeListener: (changes: {
    [key: string]: browser.Storage.StorageChange
  }) => void

  constructor(
    private schema: Schema,
    public storageKey: string = 'preferences',
  ) {
    this.changeListener = (changes) => {
      const change = changes[this.storageKey]
      if (change) {
        for (const listener of this.changeListeners
          ? [...this.changeListeners]
          : []) {
          if (typeof listener !== 'function') continue

          if (change.newValue) {
            // Validate incoming change as a full object
            if (this.isValid(change.newValue)) {
              listener({
                oldValue: change.oldValue,
                newValue: change.newValue as PrefsType,
              })
            } else {
              logGlobal('Bad change detected, ignoring', change)
            }
          } else {
            listener({ oldValue: change.oldValue, newValue: undefined })
          }
        }
      }
    }

    browser.storage.local.onChanged.addListener(this.changeListener)
  }

  /**
   * Helper to validate a full preferences object against the schema.
   */
  private isValid(obj: unknown): boolean {
    if (typeof obj !== 'object' || obj === null) return false
    for (const key in this.schema) {
      const validator = this.schema[key]!.validate
      // We safely cast keys because we are just checking existence/validity
      if (!validator((obj as any)[key])) return false
    }
    return true
  }

  /**
   * Reads with Self-Healing.
   */
  async get(): Promise<PrefsType> {
    return new Promise((resolve) => {
      browser.storage.local.get([this.storageKey]).then((result) => {
        const raw = (result[this.storageKey] ?? {}) as Record<string, unknown>
        const safeResult: any = {}

        for (const key in this.schema) {
          const option = this.schema[key]!
          const rawValue = raw[key]

          // 1. Run the manual validator
          if (option.validate(rawValue)) {
            safeResult[key] = rawValue
          } else {
            // 2. Log warning if corrupt
            if (rawValue !== undefined) {
              console.warn(
                `[Preferences] Invalid value for '${key}'. Resetting to default.`,
                `\nGot:`,
                rawValue,
              )
            }
            // 3. Fallback to default
            safeResult[key] = option.defaultValue
          }
        }

        resolve(safeResult as PrefsType)
      })
    })
  }

  /**
   * Write with Strict validation.
   */
  async set(updates: Partial<PrefsType>): Promise<void> {
    const current = await this.get()
    const merged = { ...current, ...updates }

    // Validate every field in the merged object
    for (const key in this.schema) {
      if (!this.schema[key]!.validate((merged as any)[key])) {
        throw new Error(
          `[Preferences] Invalid value for '${key}' during set(). Transaction aborted.`,
        )
      }
    }

    return new Promise((resolve) => {
      browser.storage.local.set({ [this.storageKey]: merged }).then(() => {
        resolve()
      })
    })
  }

  async reset(): Promise<void> {
    return new Promise((resolve) => {
      browser.storage.local
        .set({ [this.storageKey]: this.getDefaults() })
        .then(() => resolve())
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      browser.storage.local.remove(this.storageKey).then(() => resolve())
    })
  }

  private getDefaults(): PrefsType {
    const defaults: any = {}
    for (const key in this.schema) {
      defaults[key] = this.schema[key]!.defaultValue
    }
    return defaults
  }

  onChange(listener: PrefsChangeListener) {
    this.changeListeners.add(listener)
    return () => {
      this.changeListeners.delete(listener)
    }
  }
}
