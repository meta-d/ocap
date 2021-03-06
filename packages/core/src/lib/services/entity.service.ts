import { ComponentStore } from '@metad/store'
import { isNil, negate } from 'lodash'
import {
  BehaviorSubject,
  catchError,
  debounce,
  delayWhen,
  distinctUntilChanged,
  EMPTY,
  filter,
  interval,
  map,
  Observable,
  of,
  pluck,
  queueScheduler,
  ReplaySubject,
  scheduled,
  switchMap,
  takeUntil,
  tap
} from 'rxjs'
import { PeriodFunctions } from '../annotations'
import { DataSettings } from '../data-settings'
import { DSCoreService } from '../ds-core.service'
import { EntityService } from '../entity'
import { EntityType, getEntityProperty, Property, QueryReturn } from '../models'
import { Annotation, AnnotationTerm, PropertyPath, QueryOptions } from '../types'

export interface EntityBusinessState {
  dataSettings: DataSettings
  entityType: EntityType
  // initialised: boolean
}

export class EntityBusinessService<
  T,
  State extends EntityBusinessState = EntityBusinessState
> extends ComponentStore<State> {
  get dataSettings() {
    return this.get((state) => state.dataSettings)
  }
  set dataSettings(value) {
    this.patchState({ dataSettings: value } as State)
  }
  public readonly dataSettings$ = this.select((state) => state.dataSettings)
  readonly dataSource$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.dataSource),
    distinctUntilChanged()
  )
  readonly entitySet$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.entitySet),
    distinctUntilChanged()
  )
  get selectionVariant() {
    return this.dataSettings.selectionVariant
  }
  get presentationVariant() {
    return this.dataSettings.presentationVariant
  }
  public readonly presentationVariant$ = this.dataSettings$.pipe(map((dataSettings) => dataSettings?.presentationVariant))

  private _initialise$ = new BehaviorSubject<boolean>(null)
  readonly initialise$ = this._initialise$.asObservable().pipe(filter((initialised) => initialised))
  
  // is loading status
  public loading$ = new BehaviorSubject<boolean>(null)
  protected result$ = new BehaviorSubject<QueryReturn<T>>(null)

  entityService: EntityService<T>

  // ????????????
  public internalError$ = new ReplaySubject<any>()
  protected refresh$ = new ReplaySubject<void | boolean>()

  public readonly entityType$ = this.select((state) => state.entityType)
  constructor(public dsCoreService: DSCoreService) {
    super({} as State)

    // ???????????????????????????
    // ????????????????????????????????? query ??????
    this.refresh$
      .pipe(
        // tap(() => console.debug(`want refresh`)),
        delayWhen(() => this.initialise$),
        debounce(() => interval(100)),
        tap(() => console.debug(`refreshing`)),
        tap(() => this.loading$.next(true)),
        switchMap((force) => {
          try {
            return this.query({force}).pipe(
              tap((result) => {
                if (result.error) {
                  this.internalError$.next(result.error)
                }
              }),
              // ??????????????? refresh$ ?????????????????????
              catchError((err) => {
                console.error(err)
                this.internalError$.next(err.message)
                return of({ error: err.message })
              })
            )
          } catch(err: any) {
            console.error(err)
            this.internalError$.next(err.message)
            return of({ error: err.message })
          }
        }),
        // // ??????????????? refresh$ ?????????????????????
        // catchError((err) => {
        //   this.internalError$.next(err)
        //   return of({ error: err })
        // }),
        tap(() => {
          this.loading$.next(false)
          // this.internalError$.next('')
        }),
        takeUntil(this.destroySubject$)
      )
      .subscribe(this.result$)

    this.entitySet$
      .pipe(
        filter((entity) => !!entity),
        switchMap((entitySet) =>
          this.dataSource$.pipe(
            filter((value) => !!value),
            // tap(value => this.logger?.debug(`{${this._className_}} dataSource = ${value}`)),
            switchMap((dataSource) => this.dsCoreService.getDataSource(dataSource)),
            // untilDestroyed(this),
            map((dataSource) => dataSource.createEntityService<T>(entitySet))
          )
        ),
        tap((entityService) => {
          this.entityService?.onDestroy()
          this.entityService = entityService
          this._initialise$.next(false)
        }),
        switchMap((entityService) => {
          return entityService.selectEntityType().pipe(
            filter((value) => !!value),
            tap((entityType) => {
              this.patchState({entityType} as State)
            }),
            catchError((err) => {
              this.internalError$.next(err)
              return EMPTY
            })
          )
        }),
        // patchState ???????????????, ???????????? initialise ?????????????????????
        switchMap(() => scheduled([true], queueScheduler)),
        takeUntil(this.destroySubject$)
      )
      .subscribe((value) => {
        this._initialise$.next(value)
      })
  }

  getEntityType(): EntityType {
    return this.get(state => state.entityType)
  }
  getProperty(name: PropertyPath) {
    return getEntityProperty(this.getEntityType(), name)
  }

  /**
   * ????????????????????????????????????????????????????????????????????????
   *
   * @param options `QueryOptions`
   */
  query(options?: QueryOptions): Observable<QueryReturn<T>> {
    if (!this.entityService) {
      throw new Error(`Should provide attribute 'dataSettings' to create entity service`)
    }

    // if (
    //   isEmpty(options?.statement) &&
    //   isEmpty(options?.selects) &&
    //   isEmpty(options?.columns) &&
    //   isEmpty(options?.rows)
    // ) {
    //   return of({ results: [] })
    // }

    options = options ?? {}
    const presentationVariant = this.presentationVariant
    // Selects
    if (presentationVariant?.requestAtLeast) {
      options.selects = options.selects || []
      options.selects.push(...presentationVariant.requestAtLeast)
    }

    // OrderBys
    if (presentationVariant?.sortOrder) {
      options.orderbys = options.orderbys || []
      options.orderbys.push(...presentationVariant.sortOrder)
    }

    // Top
    if (!isNil(presentationVariant?.maxItems)) {
      options.paging = options.paging || {}
      options.paging.top = presentationVariant.maxItems
    }

    // Skip
    if (!isNil(presentationVariant?.skip)) {
      options.paging = options.paging || {}
      options.paging.skip = presentationVariant.skip
    }

    options = this.calculateFilters(options)

    return this.entityService.query(options)
  }

  refresh(force?: boolean) {
    this.refresh$.next(force)
  }

  patchData(data) {
    this.result$.next({
      ...(this.result$.value || {}),
      results: data
    })
  }

  onChange(): Observable<T[]> {
    return this.result$.pipe(pluck('results')).pipe(filter(negate(isNil)))
  }

  selectResult() {
    return this.result$.pipe(filter(value => !!value))
  }

  calculateFilters(queryOptions?: QueryOptions) {
    return queryOptions
  }

  getAnnotation<AT extends Annotation>(term: AnnotationTerm, qualifier?: string) {
    return this.entityService.getAnnotation<AT>(term, qualifier)
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    return this.entityService.getCalculatedMember(measure, type)
  }

  getIndicator(id: string) {
    return this.entityService.getIndicator(id)
  }
}
