import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { API_VISITS } from '../constants/app.constants'

@Injectable({
  providedIn: 'root'
})
export class VisitsService {
  readonly httpClient = inject(HttpClient)

  public myRecent() {
    return this.httpClient.get<any[]>(API_VISITS + '/recent')
  }

  public ranking(entity: string, owner: 'all' | 'my') {
    return this.httpClient.get<any[]>(API_VISITS + '/ranking', {params: {entity, owner}})
  }
}
