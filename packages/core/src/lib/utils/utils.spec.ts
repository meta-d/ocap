import { assignDeepOmitBlank } from './utils'

describe('Utils', () => {
  it('#should be created', () => {
    expect(
      assignDeepOmitBlank(
        {
          a: '1',
          c: {
            ca: 'c1',
            cb: 'c2'
          }
        },
        {
          b: '2',
          c: {
            cc: 'c3'
          }
        },
        1
      )
    ).toEqual({
      a: '1',
      b: '2',
      c: {
        ca: 'c1',
        cb: 'c2',
        cc: 'c3'
      }
    })

    expect(
      assignDeepOmitBlank(null,
        {
          a: '1',
          b: '2',
          c: {
            ca: 'c1',
            cb: 'c2',
            cc: 'c3'
          }
        },
        1
      )
    ).toEqual({
      a: '1',
      b: '2',
      c: {
        ca: 'c1',
        cb: 'c2',
        cc: 'c3'
      }
    })
  })
})
