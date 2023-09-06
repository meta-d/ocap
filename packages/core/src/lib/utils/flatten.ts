export function flatten(arr: Array<any>) {
  return arr?.reduce((prev, curr) => {
    prev.push(...(Array.isArray(curr) ? curr : [curr]))
    return prev
  }, [])
}
