export type JsonPrimitive = boolean | null | number | string

export type JsonObject = { [key: string]: JsonValue }

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type JfContext =
  | 'content/core'
  | 'content/console'
  | 'options/options'
  | 'worker/worker'
