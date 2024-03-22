
import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentStatusEnum, AgentType, DataSourceOptions } from '@metad/ocap-core'
import { EMPTY, Observable, of } from 'rxjs'

@Injectable()
export class S4ServerAgent implements Agent {
  type = AgentType.Server

  selectStatus(): Observable<AgentStatus | AgentStatusEnum> {
    return of({
      status: AgentStatusEnum.ONLINE,
      payload: null
    })
  }

  selectError(): Observable<any> {
    return EMPTY
  }

  error(err: any): void {
    console.error(err)
  }

  /**
   * Redirect dataSource request to current S4 backend system
   * 
   * @param dataSource DataSource options of model
   * @param request Request options
   * @returns response text
   */
  async request(dataSource: DataSourceOptions, request: {headers: any; body: string}): Promise<any> {
    const result = await fetch(`/sap/bw/xml/soap/xmla`, {
      method: 'POST',
      headers: {
        ...request.headers,
        // 'Accept-Language': this.#translateService.lang() || ''
      },
      body: request.body
    })

    return await result.text()
  }

  /**
   * 
   * @todo new api
   * @param dataSource 
   * @param options 
   * @returns 
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _request?(dataSource: DataSourceOptions, options: any): Observable<any> {
    return EMPTY
  }
}
