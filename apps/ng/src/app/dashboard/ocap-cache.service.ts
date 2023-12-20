import { Injectable } from '@angular/core'
import { DSCacheService } from '@metad/ocap-core'

@Injectable()
export class ZngOcapCacheService extends DSCacheService {
  constructor() {
    super()
    // Don't cache
    super.changeCacheLevel(-1)
  }
}
