import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs"
import { QueryReturn } from "./annotations"
import { EntityType } from "./csdl"
import { DataSource } from "./data-source"
import { EntityService } from "./ds-core.service"
import { QueryOptions } from "./types"

/**
 * 公共抽象实体服务类, 包含一些常用的公共能力如: 合并自定义 Entity 属性, 支持简易的 JavaScript 实体字段计算表达式
 */
export abstract class AbstractEntityService<T> implements EntityService<T> {

  private destroySubject$ = new Subject<void>()
  public readonly destroy$ = this.destroySubject$.asObservable()
  
  protected registerMeasures$ = new BehaviorSubject({})

  protected _entityType$ = new BehaviorSubject<EntityType>(null)
  // 合并数据源端和用户自定义 entityType 后的
  public readonly entityType$ = this._entityType$.pipe(filter(entityType => !!entityType))
  get entityType(): EntityType {
    return this._entityType$.value
  }

  constructor(public readonly dataSource: DataSource, public readonly entitySet: string) {
    combineLatest([
      this.dataSource.selectEntityType(this.entitySet),
      this.registerMeasures$
    ]).pipe(
      map(([entityType, registerMeasures]) => {
        return {
          ...entityType,
          properties: {
            ...entityType.properties,
            ...registerMeasures
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(entityType => this._entityType$.next(entityType))
  }

  selectEntityType(): Observable<EntityType> {
    return this.entityType$
  }

  query(options?: QueryOptions): Observable<QueryReturn<T>> {
    throw new Error("Method not implemented.")
  }
  
  refresh(): void {
    throw new Error("Method not implemented.")
  }

  onDestroy(): void {
    this.destroySubject$.next()
    this.destroySubject$.complete()
  }
}
