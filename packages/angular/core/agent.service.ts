import { Inject, Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentType, DSCacheService } from '@metad/ocap-core'
import { EMPTY, merge, Observable, Subject } from 'rxjs'
import { OCAP_AGENT_TOKEN } from './types'

@Injectable()
export class NgmAgentService {
  error$ = new Subject()

  _error$
  constructor(@Inject(OCAP_AGENT_TOKEN) private agents: Array<Agent>) {
    console.warn(agents)
    this._error$ = merge(...this.agents.map((agent) => agent.selectError()))
  }

  selectLocalAgentStatus(): Observable<AgentStatus> {
    const localAgent = this.agents.find((agent) => agent.type === AgentType.Local)
    if (!localAgent) {
      throw new Error(`Can't found Local Agent config`)
    }
    return localAgent?.selectStatus() ?? EMPTY
  }

  error(err: unknown) {
    this.error$.next(err)
  }

  selectError() {
    return this._error$
  }
}

@Injectable()
export class NgmDSCacheService extends DSCacheService {

}