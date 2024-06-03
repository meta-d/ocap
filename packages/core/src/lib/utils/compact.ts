export function compact<T>(arr: T[]) {
  return arr?.filter(Boolean)
}
