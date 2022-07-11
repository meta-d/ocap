import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentType, DataSourceOptions, SemanticModel } from '@metad/ocap-core'
import { from, Observable, switchMap } from 'rxjs'

@Injectable()
export class WasmAgentService implements Agent {
  type = AgentType.Wasm

  agent: Agent

  selectStatus(): Observable<AgentStatus> {
    return from(this.getWASMAgent()).pipe(switchMap((agent) => agent.selectStatus()))
  }
  selectError(): Observable<any> {
    return from(this.getWASMAgent()).pipe(switchMap((agent) => agent.selectError()))
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
