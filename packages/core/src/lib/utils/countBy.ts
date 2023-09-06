export function countBy(arr: any[], key: string): Record<string, number> {
  return arr?.reduce((prev, curr) => {
    prev[curr[key]] = prev[curr[key]] ?? 0
    prev[curr[key]]++
    return prev
  }, {}) ?? {}
}
