import { negate } from './negate'
import { pickBy } from './pickBy'

export function omitBy(obj, callbackFun: (value: any) => boolean) {
  return pickBy(obj, negate(callbackFun))
}
