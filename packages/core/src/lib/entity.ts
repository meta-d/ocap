import { Observable } from 'rxjs'
import { PeriodFunctions } from './annotations'
import { DataSource } from './data-source'
import { EntityType, Indicator, Property, QueryReturn } from './models'
import { Annotation, AnnotationTerm, Dimension, QueryOptions } from './types'

export interface EntityService<T> {
  dataSource: DataSource
  entitySet: string

  /**
   * 获取 EntityType
   */
  selectEntityType(): Observable<EntityType>

  query(options?: QueryOptions): Observable<QueryReturn<T>>

  refresh(): void

  /**
   * 获取当前 entity 的指定注解
   *
   * @param term 注解的类型
   * @param qualifier 注解标识符，可选
   */
  getAnnotation<AT extends Annotation>(term: AnnotationTerm, qualifier?: string): Observable<AT>

  /**
   * 获取字段维度的所有成员
   */
  getMembers<M>(property: Dimension): Observable<Array<M>>

  /**
   * 获取常用函数生成的计算度量成员
   *
   * @param measure
   * @param type
   */
  getCalculatedMember(measure: string, type: PeriodFunctions): Property

  getIndicator(id: string): Indicator

  onDestroy(): void
}
