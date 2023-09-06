import { Injectable, OnDestroy } from '@angular/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { SmartFilterService } from '@metad/ocap-core'

@Injectable()
export class NgmSmartFilterService extends SmartFilterService implements OnDestroy {
  constructor(dsCoreService: NgmDSCoreService) {
    super(dsCoreService)
  }

  ngOnDestroy(): void {
    super.onDestroy()
  }
}
