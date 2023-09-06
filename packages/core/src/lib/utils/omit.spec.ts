import { omit } from './omit'

describe('Omit', () => {
  it('#should be true', () => {
    expect(
      omit(
        {
          a: 1,
          b: 2,
          c: 3
        },
        ['a']
      )
    ).toEqual({
      b: 2,
      c: 3
    })

    expect(
      omit(
        {
          a: 1,
          b: 2,
          c: 3
        },
        'a'
      )
    ).toEqual({
      b: 2,
      c: 3
    })

    expect(
      omit(
        {
          a: 1,
          b: 2,
          c: 3
        },
        ['a', 'c']
      )
    ).toEqual({
      b: 2
    })
  })
})
