import { nonNullable } from './helpers'

describe('nonNullable', () => {
  it('nonNullable', () => {
    expect(nonNullable(undefined)).toEqual(false)
  })
})
