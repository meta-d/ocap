import { compact } from "./compact"

describe('Compact', () => {
  it('#should be created', () => {
    expect(compact(['', null, undefined, false, true])).toEqual([true])
  })
})
