import { Injectable, Optional } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { ChartBusinessService } from '@metad/ocap-core'

@Injectable()
export class AnalyticalCardService<T> extends ChartBusinessService<T> {
  constructor(dsCoreService: NgmDSCoreService, @Optional() filterBarService: NgmSmartFilterBarService) {
    super(dsCoreService, filterBarService)
  }
}
