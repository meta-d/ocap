import { Injectable } from '@angular/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { SmartFilterService } from '@metad/ocap-core'

@Injectable()
export class NgmSmartFilterService extends SmartFilterService {
  constructor(dsCoreService: NgmDSCoreService) {
    super(dsCoreService)
  }
}
