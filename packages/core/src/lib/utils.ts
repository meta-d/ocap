import { isNil, isString, merge } from 'lodash'

export function isBlank(value) {
  return isNil(value) || (isString(value) && !value.trim())
}
export function mergeOptions(obj1: unknown, ...objs: unknown[]) {
  return merge(obj1, ...objs.map((item) => omitBlank(item)))
}

export function omitBlank(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => omitBlank(value))
  } else if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([, v]) => !isBlank(v))
      .reduce((r, [key, value]) => ({ ...r, [key]: omitBlank(value) }), {})
  } else {
    return obj
  }
}
