export function isNil(value: any): value is null | undefined {
  return value === null || typeof value === 'undefined'
}

export function isArray(value: any): boolean {
  return Array.isArray(value)
}
