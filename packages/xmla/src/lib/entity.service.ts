import {
  AbstractEntityService,
  Annotation,
  AnnotationTerm,
  Cache,
  CalculatedProperty,
  EntityService,
  getCalendarDimension,
  getDefaultHierarchy,
  getEntityDimensions,
  getEntityHierarchy,
  getEntityProperty,
  HttpHeaders,
  PeriodFunctions,
  Property,
  PropertyMeasure,
  QueryOptions,
  QueryReturn,
  RecursiveHierarchyType,
  Semantics,
} from '@metad/ocap-core'
import { BehaviorSubject, EMPTY, firstValueFrom, from, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { XmlaDataSource, XMLA_TEXT_FIELD_SUFFIX } from './ds-xmla.service'
import {
  CURRENT,
  MOM,
  MOMGAP,
  MPM,
  MPMYOY,
  MTD,
  PYSM,
  PYSMYOY,
  PYYTD,
  QTD,
  WTD,
  YOY,
  YOYGAP,
  YTD,
  YTDOM,
  YTDOY,
  YTDOYGAP
} from './functions/calendar'
import { generateMDXQuery } from './mdx-query'
import { generateMDXStatement } from './mdx-statement'
import { IntrinsicMemberProperties } from './reference'
import { escapeBWSlash, LANGUAGE_CODES_SAPBW, MDXDialect, wrapHierarchyValue } from './types'
import { getErrorMessage, getExceptionMessage, simplifyErrorMessage } from './utils'
import { fetchDataFromMultidimensionalTuple } from './xmla/multidimensional'

export class XmlaEntityService<T> extends AbstractEntityService<T> implements EntityService<T> {

  protected annotations$ = new BehaviorSubject<{ [key: string]: Annotation }>(null)

  constructor(public override readonly dataSource: XmlaDataSource, public override readonly entitySet: string) {
    super(dataSource, entitySet)
  }

  override getAnnotation<AT extends Annotation>(term: string, qualifier: string): Observable<AT> {
    const path = term + (qualifier ? `#${qualifier}` : '')
    const annotations = this.annotations$.getValue()
    return this.dataSource
      .getAnnotation<AT>(this.entitySet, AnnotationTerm[term], qualifier)
      .pipe(map((annotation) => (annotation ? annotation : annotations?.[path]) as AT))
  }

  selectAssociations(): Observable<[]> {
    throw new Error('Method not implemented.')
  }

  getOne(id: any): Observable<T> {
    throw new Error('Method not implemented.')
  }
  create(entity: T): Observable<T> {
    throw new Error('Method not implemented.')
  }
  update(entity: T): Observable<void> {
    throw new Error('Method not implemented.')
  }
  delete(criteria: any): Observable<void> {
    throw new Error('Method not implemented.')
  }

  refresh(): void {
    //
  }

  override query(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    return this.selectQuery(options)
  }

  override selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    /**
     * @todo 放在这里过滤不合适
     */
    if (!options?.columns?.length && !options?.rows?.length) {
      // console.error(`Please use rows or columns in entity query fields`, options)
      // throw new Error(`Please use rows or columns in entity query fields`)
      return EMPTY
    }

    const cube = this.dataSource.options.schema?.cubes?.find(({ name }) => name === this.entitySet)
    try {
      if (options) {
        // Language
        options = this.setLanguage(options)
      }
      
      const mdxQuery = generateMDXQuery(this.entitySet, {
        ...this.entityType,
        cube
      }, options)
      
      mdxQuery.cube = cube
      const mdx =
        options.statement || generateMDXStatement(mdxQuery, this.entityType, this.entityType.dialect as MDXDialect)

      if (mdx) {

        let recursiveHierarchy: RecursiveHierarchyType
        const hRow = mdxQuery.rows?.find((row) => row.displayHierarchy)
        if (hRow) {
          recursiveHierarchy = {
            parentNodeProperty: wrapHierarchyValue(hRow.hierarchy, IntrinsicMemberProperties[IntrinsicMemberProperties.PARENT_UNIQUE_NAME]),
            valueProperty: hRow.hierarchy,
            labelProperty: getEntityHierarchy(this.entityType, hRow).memberCaption
          }
        }

        return from(
          this.execute(this.dataSource.options.name, mdx, this.dataSource.options.settings?.language || '', {
            skip: options.force
          })
        ).pipe(
          map(({ rows, columns, data, cellset, columnAxes }) => {
            const fields = [...mdxQuery.rows, ...mdxQuery.columns]
            // for SAP BW escaped property name _
            fields.forEach((field) => {
              field.properties?.forEach((property) => {
                const escaped = escapeBWSlash(field.dimension, property)
                data.forEach((element) => {
                  element[property] = element[escaped]
                })
              })
            })

            let results = data.map((item) => {
              const _item = { ...item }
              fields.forEach((property) => {
                if (property.hierarchy && property.dimension) {
                  _item[property.dimension] = _item[property.hierarchy]
                  if (_item[property.hierarchy + XMLA_TEXT_FIELD_SUFFIX]) {
                    _item[property.dimension + XMLA_TEXT_FIELD_SUFFIX] =
                      _item[property.hierarchy + XMLA_TEXT_FIELD_SUFFIX]
                  }
                }
              })
              return _item
            })

            // 排除无值成员
            mdxQuery.rows?.forEach((row) => {
              if (!row.unbookedData) {
                results = results.filter((item) => item[row.dimension] !== '[#]')
              }
            })

            return {
              data: results,
              schema: {
                rows,
                columns,
                recursiveHierarchy,
                rowHierarchy: hRow?.hierarchy,
                columnAxes
              },
              cellset,
              stats: {
                statements: [
                  mdx
                ]
              }
            }
          }),
          catchError((error, caught) => {
            console.group('MDX Query')
            console.debug(`MDX EntityType:`, this.entityType)
            console.debug(`MDX options:`, options)
            console.debug(`MDX Query:`, mdxQuery)
            console.error(`MDX:`, mdx, '\nError\n', error)
            console.groupEnd()

            return of({
              status: 'ERROR' as QueryReturn<T>['status'],
              error: simplifyErrorMessage(getExceptionMessage(error.exception) ?? getErrorMessage(error)),
              stats: {
                statements: [
                  mdx
                ]
              }
            })
          })
        )
      }

      // console.debug(`MDX:`, mdx, '\n==>\n', [])
      return of({ data: [], error: `can't find MDX statement` })
    } catch (err) {
      // console.group('MDX Query ERROR:')
      // console.debug(`MDX EntityType:`, this.entityType)
      // console.debug(`MDX options:`, options)
      // console.error('Error', err)
      // console.groupEnd()

      return of({
        status: 'ERROR',
        error: err as unknown as string
      })
    }
  }

  @Cache('xmla-mdx:', { maxAge: 1000 * 60 * 60, level: 3 })
  async execute(modelName: string, mdx: string, language = '', options: { skip: boolean | void }): Promise<any> {
    const headers: HttpHeaders = {}
    if (language) {
      headers['Accept-Language'] = language
    }

    const dataset = await firstValueFrom(this.dataSource.xmlaService.execute(mdx, { headers, forceRefresh: options?.skip }))

    return fetchDataFromMultidimensionalTuple(dataset, this.entityType, mdx)
  }

  /**
   * 为查询条件添加系统语言过滤器
   *
   * @param options
   * @returns
   */
  setLanguage(options: QueryOptions<unknown>) {
    if (this.dataSource.options.settings?.language) {
      const language =
        this.dataSource.options.dialect === MDXDialect.SAPBW
          ? LANGUAGE_CODES_SAPBW[this.dataSource.options.settings.language]
          : this.dataSource.options.settings.language
      const property = getEntityDimensions(this.entityType).find((property) => property.semantic === Semantics.Language)
      if (property) {
        options.filters.push({
          dimension: {
            dimension: property.name
          },
          members: [{ value: language, key: language }]
        })
      }
    }
    return options
  }

  getCalculatedMember(measure: string, type: PeriodFunctions, calendar?: string): Property {
    const measureProperty = getEntityProperty(this.entityType, measure)
    // Get calendar hierarchy or default calendar dimension's hierarchy
    const calendarHierarchy = calendar ? getEntityHierarchy(this.entityType, { hierarchy: calendar }) : 
      getDefaultHierarchy(getCalendarDimension(this.entityType))
    
    let property: PropertyMeasure
    switch (type) {
      case PeriodFunctions.CURRENT:
        property = CURRENT(measure, measureProperty)
        break
      case PeriodFunctions.YTD:
        property = YTD(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.QTD:
        property = QTD(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.WTD:
        property = WTD(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.MTD:
        property = MTD(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.PYYTD:
        property = PYYTD(measure, calendarHierarchy)
        break
      case PeriodFunctions.MOM:
        property = MOM(measure, calendarHierarchy)
        break
      case PeriodFunctions.MOMGAP:
        property = MOMGAP(measure, calendarHierarchy)
        break
      case PeriodFunctions.YOY:
        property = YOY(measure, calendarHierarchy)
        break
      case PeriodFunctions.YOYGAP:
        property = YOYGAP(measure, calendarHierarchy)
        break
      case PeriodFunctions.PYSM:
        property = PYSM(measure, calendarHierarchy)
        break
      case PeriodFunctions.PYSMYOY:
        property = PYSMYOY(measure, calendarHierarchy)
        break
      case PeriodFunctions.MPM:
        property = MPM(measure, calendarHierarchy)
        break
      case PeriodFunctions.MPMYOY:
        property = MPMYOY(measure, calendarHierarchy)
        break
      case PeriodFunctions.YTDOM:
        property = YTDOM(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.YTDOY:
        property = YTDOY(measure, measureProperty, calendarHierarchy)
        break
      case PeriodFunctions.YTDOYGAP:
        property = YTDOYGAP(measure, measureProperty, calendarHierarchy)
        break
    }

    if (property) {
      this.registerMeasure(property.name, property as CalculatedProperty)
    }

    return property
  }
}
