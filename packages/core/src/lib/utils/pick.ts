export function pick(object: any, ...keys: string[]) {
  return object && (keys?.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key]
    }
    return obj
  }, {}) ?? {})
}
