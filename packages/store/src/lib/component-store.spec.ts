import { ComponentStore } from './component-store'

describe('ComponentStore', () => {
  it('#select', (done) => {
    const store = new ComponentStore({ a: 1 })
    store
      .select((state) => state.a)
      .subscribe((a) => {
        expect(a).toEqual(1)
        done()
      })
  })
})
