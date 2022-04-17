import { ComponentStore } from "@metad/store";
import { of } from "rxjs";

export interface DataSourceOptions {
  name: string
}

export interface DSState {
  dataSources: DataSourceOptions[]
}

export class DSCoreService extends ComponentStore<DSState> {

  selectEntity(entity: string) {
    return of(entity === 'Sales' ? {
      results: [
        {
          A: 'A1',
          C: 100
        },
        {
          A: 'A2',
          C: 200
        },
      ]
    } : {
      results: [
        {
          A: 'A1',
          C: 200
        },
        {
          A: 'A2',
          C: 100
        },
        {
          A: 'A3',
          C: 300
        },
      ]
    })
  }
}