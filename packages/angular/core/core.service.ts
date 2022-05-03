import { Inject, Injectable } from '@angular/core'
import { Agent, DataSourceOptions, DSCoreService } from '@metad/ocap-core'
import { OCAP_AGENT_TOKEN, OCAP_MODEL_TOKEN } from './types'

@Injectable()
export class MetadDSCoreService extends DSCoreService {
  constructor(
    @Inject(OCAP_AGENT_TOKEN)
    public override agents: Array<Agent>,
    @Inject(OCAP_MODEL_TOKEN)
    public models: Array<DataSourceOptions>,
  ) {
    super(agents, models)
  }
}
