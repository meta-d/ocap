import { Injectable, OnDestroy } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { SmartFilterService } from '@metad/ocap-core'

@Injectable()
export class NgmSmartFilterService extends SmartFilterService implements OnDestroy {
  constructor(dsCoreService: NgmDSCoreService, ngmFilterBarService: NgmSmartFilterBarService) {
    super(dsCoreService, ngmFilterBarService)
  }

  ngOnDestroy(): void {
    super.onDestroy()
  }
}
