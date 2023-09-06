import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { IDataSourceType } from '@metad/contracts'
import { map, shareReplay } from 'rxjs/operators'
import { API_DATA_SOURCE_TYPE } from './constants'

/**
 */
@Injectable({
  providedIn: 'root'
})
export class DataSourceTypesService {

  public readonly types$ = this.getAll().pipe(shareReplay(1))

  constructor(public httpClient: HttpClient) {}

  getAll() {
    return this.httpClient.get<{ items: Array<IDataSourceType> }>(API_DATA_SOURCE_TYPE).pipe(map(({ items }) => items))
  }
}
