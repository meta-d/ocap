import { Injectable, Optional } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { AnalyticsBusinessService } from '@metad/ocap-core'

@Injectable()
export class NgmAnalyticsBusinessService<T> extends AnalyticsBusinessService<T> {
  constructor(override readonly dsCoreService: NgmDSCoreService, @Optional() smartFilterbar: NgmSmartFilterBarService) {
    super(dsCoreService, smartFilterbar)
  }
}
