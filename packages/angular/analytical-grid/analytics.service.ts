import { Injectable } from '@angular/core'
import { AnalyticsBusinessService } from '@metad/ocap-core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'

@Injectable()
export class NgmAnalyticsBusinessService<T> extends AnalyticsBusinessService<T> {
  constructor(override readonly dsCoreService: NgmDSCoreService) {
    super(dsCoreService)
  }
}
