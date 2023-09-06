export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return Array.isArray(value)
}
