import { BehaviorSubject, combineLatest, filter, map, Observable, of, Subject, takeUntil } from 'rxjs'
import { PeriodFunctions } from './annotations'
import { DataSource } from './data-source'
import { EntityService } from './entity'
import { CalculatedProperty, EntityType, Property, QueryReturn } from './models'
import { Annotation, Dimension, QueryOptions } from './types'

/**
 * 公共抽象实体服务类, 包含一些常用的公共能力如: 合并自定义 Entity 属性, 支持简易的 JavaScript 实体字段计算表达式
 */
export abstract class AbstractEntityService<T> implements EntityService<T> {
  private destroySubject$ = new Subject<void>()
  public readonly destroy$ = this.destroySubject$.asObservable()

  protected registerMeasures$ = new BehaviorSubject({})

  protected _entityType$ = new BehaviorSubject<EntityType>(null)
  // 合并数据源端和用户自定义 entityType 后的
  public readonly entityType$ = this._entityType$.pipe(filter((entityType) => !!entityType))
  get entityType(): EntityType {
    return this._entityType$.value
  }

  constructor(public readonly dataSource: DataSource, public readonly entitySet: string) {
    combineLatest([this.dataSource.selectEntityType(this.entitySet), this.registerMeasures$])
      .pipe(
        map(([entityType, registerMeasures]) => {

          // console.log(`[AbstractEntityService] entityType:`, entityType, `registerMeasures:`, registerMeasures )
          
          return {
            ...entityType,
            properties: {
              ...entityType.properties,
              ...registerMeasures
            }
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((entityType) => this._entityType$.next(entityType))
  }

  abstract getCalculatedMember(measure: string, type: PeriodFunctions): Property
  
  getMembers<M>(property: Dimension): Observable<M[]> {
    throw new Error('method unimplemented')
  }
  
  selectEntityType(): Observable<EntityType> {
    return this.entityType$
  }

  query(options?: QueryOptions): Observable<QueryReturn<T>> {
    throw new Error('Method not implemented.')
  }

  refresh(): void {
    throw new Error('Method not implemented.')
  }

  getAnnotation<AT extends Annotation>(term: string, qualifier: string): Observable<AT> {
    return of(null)
  }

  getIndicator(id: string) {
    return this.dataSource.getIndicator(id, this.entitySet)
  }

  registerMeasure(name: string, property: CalculatedProperty) {
    const registerMeasures = this.registerMeasures$.value
    this.registerMeasures$.next({
      ...registerMeasures,
      [name]: property
    })
  }

  onDestroy(): void {
    this.destroySubject$.next()
    this.destroySubject$.complete()
  }
}
