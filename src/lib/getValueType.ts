import {
  TYPE_ARRAY,
  TYPE_BOOL,
  TYPE_NULL,
  TYPE_NUMBER,
  TYPE_OBJECT,
  TYPE_STRING,
} from './constants'
import { JsonValue } from './types'

export const getValueType = (value: JsonValue) => {
  if (typeof value === 'string') return TYPE_STRING
  if (typeof value === 'number') return TYPE_NUMBER
  if (value === false || value === true) return TYPE_BOOL
  if (value === null) return TYPE_NULL
  if (Array.isArray(value)) return TYPE_ARRAY

  return TYPE_OBJECT
}
