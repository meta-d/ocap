export function flattenDeep<T>(arr: any[]) {
  return Array.isArray(arr) ? arr.reduce<T[]>((a, b) => a.concat(flattenDeep(b)), []) : arr ? [arr as T] : []
}
