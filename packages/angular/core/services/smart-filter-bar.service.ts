import { Injectable, Optional, SkipSelf } from '@angular/core'
import { SmartFilterBarService } from '@metad/ocap-core'

@Injectable()
export class NgmSmartFilterBarService extends SmartFilterBarService {
  constructor(
    @Optional()
    @SkipSelf()
    parent?: NgmSmartFilterBarService
  ) {
    super(parent)
  }
}
