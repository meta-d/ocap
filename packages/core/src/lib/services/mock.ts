import { Observable, of } from 'rxjs'
import { PeriodFunctions } from '../annotations'
import { AbstractDataSource, DataSource, DataSourceOptions } from '../data-source'
import { EntityService } from '../entity'
import {
  AggregationRole,
  Catalog,
  EntitySet,
  EntityType,
  IDimensionMember,
  Indicator,
  Property,
  QueryReturn
} from '../models'
import { Annotation, AnnotationTerm, Dimension, QueryOptions } from '../types'

export class MockDataSource extends AbstractDataSource<DataSourceOptions> {
  createEntityService<T>(entity: string): EntityService<T> {
    return new MockEntityService<T>(this, entity)
  }
  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  getEntityType(entity: string): Observable<EntityType> {
    return of({
      name: entity,
      properties: {
        Department: {
          name: 'Department',
          role: AggregationRole.dimension
        },
        sales: {
          name: 'sales',
          role: AggregationRole.measure
        }
      }
    })
  }
  getCatalogs(): Observable<Catalog[]> {
    throw new Error('Method not implemented.')
  }
  getMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }
  query({ statement: string }: { statement: any }): Observable<any> {
    throw new Error('Method not implemented.')
  }
}

export class MockEntityService<T> implements EntityService<T> {
  constructor(public dataSource: DataSource, public entitySet: string) {}

  selectEntityType(): Observable<EntityType> {
    return this.dataSource.selectEntityType(this.entitySet)
  }
  query(options?: QueryOptions<T>): Observable<QueryReturn<T>> {
    return of({
      data: [],
      options
    })
  }
  refresh(): void {
    throw new Error('Method not implemented.')
  }
  getAnnotation<AT extends Annotation>(term: AnnotationTerm, qualifier?: string): Observable<AT> {
    throw new Error('Method not implemented.')
  }
  getMembers<M>(property: Dimension): Observable<M[]> {
    throw new Error('Method not implemented.')
  }
  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    throw new Error('Method not implemented.')
  }
  getIndicator(id: string): Indicator {
    throw new Error('Method not implemented.')
  }
  onDestroy(): void {
    throw new Error('Method not implemented.')
  }
}
