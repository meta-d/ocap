/**
 * @deprecated Use the native global [`structuredClone()`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) method
 * @param obj 
 * @returns 
 */
export function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj))
}
