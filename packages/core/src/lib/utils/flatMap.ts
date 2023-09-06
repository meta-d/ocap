export function flatMap(arr: Array<any>, callbackFn: (x) => any) {
  return arr?.reduce((prev, curr) => {
    prev.push(...callbackFn(curr))
    return prev
  }, [])
}
