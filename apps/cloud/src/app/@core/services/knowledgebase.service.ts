import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { API_PREFIX, OrganizationBaseCrudService } from '@metad/cloud/state'
import { IKnowledgebase } from '@metad/contracts'
import { NGXLogger } from 'ngx-logger'
import { CopilotRoleService } from './copilot-role.service'

const API_KNOWLEDGEBASE = API_PREFIX + '/knowledgebase'

@Injectable({ providedIn: 'root' })
export class KnowledgebaseService extends OrganizationBaseCrudService<IKnowledgebase> {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  constructor() {
    super(API_KNOWLEDGEBASE)
  }
}
