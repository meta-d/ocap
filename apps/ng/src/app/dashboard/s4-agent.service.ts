import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentStatusEnum, AgentType, DataSourceOptions } from '@metad/ocap-core'
import { Observable } from 'rxjs'


export interface PacServerAgentDefaultOptions {
  modelBaseUrl: string
}

@Injectable()
export class S4ServerAgent implements Agent {
  type = AgentType.Server

  selectStatus(): Observable<AgentStatus | AgentStatusEnum> {
    throw new Error('Method not implemented.')
  }
  selectError(): Observable<any> {
    throw new Error('Method not implemented.')
  }
  error(err: any): void {
    console.error(err)
  }
  async request(dataSource: DataSourceOptions, options: any): Promise<any> {
    console.log(dataSource, options)

    const result = await fetch(`/sap/bw/xml/soap/xmla?sap-client=400`, {
      method: 'POST',
      headers: {
        ...options.headers,
      },
      body: options.body,
    })

    return await result.text()
  }
  _request?(dataSource: DataSourceOptions, options: any): Observable<any> {
    throw new Error('Method not implemented.')
  }
}
