import { isNil } from './isNil'

export function isString(str: any): str is string {
  if (!isNil(str) && typeof str.valueOf() === 'string') {
    return true
  }
  return false
}
