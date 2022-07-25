import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentType, DataSourceOptions, SemanticModel } from '@metad/ocap-core'
import { BehaviorSubject, filter, Observable, switchMap } from 'rxjs'

@Injectable()
export class WasmAgentService implements Agent {
  type = AgentType.Wasm

  get agent() {
    return this.agent$.value
  }
  set agent(value) {
    this.agent$.next(value)
  }
  private agent$ = new BehaviorSubject<Agent>(null)

  selectStatus(): Observable<AgentStatus> {
    return this.agent$.pipe(
      filter((agent) => !!agent),
      switchMap((agent) => agent.selectStatus())
    )
  }
  selectError(): Observable<any> {
    return this.agent$.pipe(
      filter((agent) => !!agent),
      switchMap((agent) => agent.selectError())
    )
  }
  error(err: any): void {
    this.getWASMAgent().then((agent) => agent.error(err))
  }

  async request(dataSource: DataSourceOptions, options: any): Promise<any> {
    await this.getWASMAgent()
    return this.agent.request(dataSource, options)
  }

  async registerModel(model: SemanticModel) {
    await this.getWASMAgent()
    await (this.agent as any).registerModel(model)
  }

  async getWASMAgent() {
    if (!this.agent) {
      const { DuckdbWasmAgent } = await import('@metad/ocap-duckdb')
      this.agent = new DuckdbWasmAgent([])
    }

    return this.agent
  }
}
