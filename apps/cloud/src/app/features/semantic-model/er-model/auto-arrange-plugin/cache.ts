export class Cache {
  _map = new WeakMap()

  track(value) {
    if (this._map.has(value)) {
        return true
    } else {
      this._map.set(value, true)
      return false
    }
  }
}
