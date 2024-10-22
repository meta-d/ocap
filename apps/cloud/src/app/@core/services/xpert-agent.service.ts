import { inject, Injectable } from '@angular/core'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable } from 'rxjs'
import { API_XPERT_AGENT } from '../constants/app.constants'
import { IXpert, IXpertAgent } from '../types'
import { XpertWorkspaceBaseCrudService } from './xpert-workspace.service'
import { Store } from './store.service'
import { pick } from 'lodash-es'

@Injectable({ providedIn: 'root' })
export class XpertAgentService extends XpertWorkspaceBaseCrudService<IXpertAgent> {
  readonly #logger = inject(NGXLogger)
  readonly #store = inject(Store)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_XPERT_AGENT)
  }

  chatAgent(data: {input: string; agent: IXpertAgent; xpert: IXpert}): Observable<any> {
    const token = this.#store.token
    const organization = this.store.selectedOrganization ?? {id: null}
    return new Observable((subscriber) => {
      const ctrl = new AbortController()
      fetchEventSource(this.apiBaseUrl + `/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Organization-Id': `${organization.id}`
        },
        body: JSON.stringify({
          input: data.input,
          agent: data.agent,
          xpert: pick(data.xpert, 'id', 'name', 'copilotId', 'copilotModel')
        }),
        signal: ctrl.signal,
        onmessage(msg) {
          subscriber.next(msg)
        },
        onclose() {
          subscriber.complete()
        },
        onerror(err) {
          subscriber.error(err)
        }
      })

      return () => ctrl.abort()
    })
  }
}
