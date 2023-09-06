import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_PREFIX } from '@metad/cloud/state'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private http: HttpClient) {}

  getTenantAgentLocal(): Observable<string> {
    return this.http.get<any>(`${API_PREFIX}/agent`).pipe(
      map((result) => {
        if (result.success) {
          return result.record?.value
        }
        return null
      })
    )
  }
}
