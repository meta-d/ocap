export function omit<T, K extends keyof T>(obj: T, ...keys: Array<K | K[]>) {
  return keys.reduce((obj, key) => {
    return (Array.isArray(key) ? key : [key]).reduce((obj, key) => {
      const { [key]: omitted, ...rest } = obj
      return rest
    }, obj)
  }, obj ?? {})
}
