import { Injectable, Optional } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { SmartFilterService } from '@metad/ocap-core'

@Injectable()
export class NgmSmartFilterService<T> extends SmartFilterService<T> {
  constructor(
    dsCoreService: NgmDSCoreService,
  ) {
    super(dsCoreService)
  }
}
