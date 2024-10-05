import { inject, Injectable } from '@angular/core'
import { OrganizationBaseCrudService } from '@metad/cloud/state'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { API_XPERT_TOOLSET } from '../constants/app.constants'
import { IXpertToolset } from '../types'

@Injectable({ providedIn: 'root' })
export class XpertToolsetService extends OrganizationBaseCrudService<IXpertToolset> {
  readonly #logger = inject(NGXLogger)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_XPERT_TOOLSET)
  }
}
