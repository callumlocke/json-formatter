export type JsonPrimitive = boolean | null | number | string

export type JsonObject = { [key: string]: JsonValue }

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray
