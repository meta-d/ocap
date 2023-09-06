export function omit(obj: any, ...keys: string[]) {
  return keys.reduce((obj, key) => {
    const { [key]: omitted, ...rest } = obj
    return rest
  }, obj ?? {})
}
