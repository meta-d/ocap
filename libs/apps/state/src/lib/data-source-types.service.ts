import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { IDataSourceType } from '@metad/contracts'
import { map, shareReplay } from 'rxjs/operators'
import { API_DATA_SOURCE_TYPE } from './constants'

/**
 */
@Injectable({
  providedIn: 'root'
})
export class DataSourceTypesService {

  private readonly httpClient = inject(HttpClient)

  public readonly types$ = this.getAll().pipe(shareReplay(1))

  getAll() {
    return this.httpClient.get<{ items: Array<IDataSourceType> }>(API_DATA_SOURCE_TYPE).pipe(map(({ items }) => items))
  }
}
