export function pick<T = any>(object: T, ...keys: Array<string>): Partial<T> {
  return object && (keys?.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key]
    }
    return obj
  }, {} as T) ?? {} as T)
}
