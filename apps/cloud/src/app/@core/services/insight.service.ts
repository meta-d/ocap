import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class InsightService {

    all$ = of([])
  constructor(private httpClient: HttpClient) {}

  create(params: any) {
    return of(null)
  }
  delete(params: any) {
    return of(null)
  }
  selectOne(id: string) {
    return of(null)
  }
  updateEntity(entity: any) {}

  insight(params: any) {
    return of(null)
  }

  suggests(params: any) {
    return of(null)
  }
}
