import { formatNumber } from './decimal'

describe('formatNumber', () => {
  it('#Basic', () => {
    expect(formatNumber(123.12345, 'zh-Hans')).toEqual(`123.12`)
  })
})
