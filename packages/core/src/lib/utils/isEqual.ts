import equal from 'fast-deep-equal/es6'

export function isEqual<T>(a: T, b: T): boolean {
  return equal(a, b)
}
