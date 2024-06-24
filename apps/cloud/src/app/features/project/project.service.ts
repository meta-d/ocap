import { Injectable, computed, inject, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import {
  BusinessAreasService,
  IndicatorsService,
  NgmSemanticModel,
  convertIndicatorResult,
  hierarchizeBusinessAreas
} from '@metad/cloud/state'
import { dirtyCheckWith, nonBlank } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { Indicator, MDCube, isEntitySet, isEqual, negate } from '@metad/ocap-core'
import { Store, createStore, withProps } from '@ngneat/elf'
import { stateHistory } from '@ngneat/elf-state-history'
import { cloneDeep } from 'lodash-es'
import {
  EMPTY,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap
} from 'rxjs'
import {
  IProject,
  ISemanticModel,
  ProjectsService,
  TagService,
  ToastrService,
  getErrorMessage,
  isUUID,
  registerModel
} from '../../@core'
import { ProjectIndicatorsState, injectFetchModelDetails } from './types'

@Injectable()
export class ProjectService {
  readonly projectsService = inject(ProjectsService)
  readonly indicatorsService = inject(IndicatorsService)
  readonly businessAreasStore = inject(BusinessAreasService)
  readonly tagService = inject(TagService)
  readonly dsCoreService = inject(NgmDSCoreService)
  readonly wasmAgent = inject(WasmAgentService)
  readonly toastrService = inject(ToastrService)
  readonly fetchModelDetails = injectFetchModelDetails()

  readonly project = signal<IProject>(null)

  readonly project$ = toObservable(this.project)

  readonly models = computed(() => this.project()?.models)
  readonly models$ = toObservable(this.models)
  readonly dataSources = computed(() =>
    this.models()?.map((model) => ({
      key: model.key,
      caption: model.name,
      value: model.id
    }))
  )

  readonly modelDetails = signal<Record<string, ISemanticModel>>({})

  readonly modelCubes$ = this.models$.pipe(
    tap(async (models) => {
      for await (const model of models) {
        await this.registerModel(model.key)
      }
    }),
    switchMap((models) =>
      combineLatest(
        models.map((model) =>
          this.selectDataSource(model.key).pipe(
            switchMap((dataSource) => dataSource.discoverMDCubes()),
            catchError((err) => {
              console.group('Project')
              console.error('Error fetching cubes in project:')
              console.error(err)
              console.groupEnd()
              return EMPTY
            }),
            startWith([] as MDCube[])
          )
        )
      ).pipe(map((cubess) => cubess.map((cubes, index) => ({ ...models[index], cubes }))))
    ),
    shareReplay(1)
  )

  /**
   * Indicators
   */
  readonly indicators = computed(() => this.project()?.indicators)
  // readonly newIndicators = signal<Indicator[]>([])
  // readonly newIndicators$ = toObservable(this.newIndicators)

  readonly iStore = createStore({ name: 'project_indicators' }, withProps<ProjectIndicatorsState>({ indicators: [] }))
  readonly iPristineStore = createStore(
    { name: 'project_indicators_pristine' },
    withProps<ProjectIndicatorsState>({ indicators: [] })
  )
  readonly #stateHistory = stateHistory<Store, ProjectIndicatorsState>(this.iStore, {
    comparatorFn: negate(isEqual)
  })
  readonly dirtyCheckResult = dirtyCheckWith(this.iStore, this.iPristineStore, { comparator: negate(isEqual) })
  readonly indicators$ = this.iStore.pipe(map((state) => state.indicators))

  readonly dirty = signal<Record<string, boolean>>({})
  readonly hasDirty = computed(() => Object.values(this.dirty()).some((dirty) => dirty))
  readonly loading = signal(false)

  /**
   * Business Areas
   */
  readonly businessAreas = toSignal(this.businessAreasStore.getMy().pipe(startWith([])))
  readonly businessAreasTree = computed(() => hierarchizeBusinessAreas(this.businessAreas()))

  /**
   * Tags
   */
  readonly tags = toSignal(this.tagService.getAll('indicator'), { initialValue: [] })

  setProject(project: IProject) {
    this.project.set(project)
    const indicators = project.indicators.map(convertIndicatorResult)
    this.iStore.update(() => ({ indicators: cloneDeep(indicators) }))
    this.iPristineStore.update(() => ({ indicators: cloneDeep(indicators) }))
  }

  updateProject(project: Partial<IProject>): void
  updateProject(updateFn: (value: IProject) => IProject): void
  updateProject(project: Partial<IProject> | ((value: IProject) => IProject)) {
    if (typeof project === 'function') {
      this.project.update(project)
    } else {
      this.project.update((prev) => ({ ...prev, ...project }))
    }
  }

  async registerModel(modelKey: string) {
    if (modelKey && !this.modelDetails()[modelKey]) {
      const semanticModel = await firstValueFrom(
        this.fetchModelDetails(this.models().find((item) => item.key === modelKey).id)
      )

      registerModel(semanticModel as NgmSemanticModel, this.dsCoreService, this.wasmAgent)
    }
  }

  /**
  |--------------------------------------------------------------------------
  | Selectors
  |--------------------------------------------------------------------------
  */
  selectDataSource(dataSource: string) {
    return this.dsCoreService.getDataSource(dataSource)
  }
  selectEntityType(dataSource: string, cube: string) {
    return this.selectDataSource(dataSource).pipe(
      switchMap((dataSource) => dataSource.selectEntitySet(cube)),
      map((entitySet) => {
        if (isEntitySet(entitySet)) {
          return entitySet.entityType
        } else {
          console.error('EntitySet not found', entitySet)
          throw entitySet
        }
      })
    )
  }

  /**
  |--------------------------------------------------------------------------
  | Indicators
  |--------------------------------------------------------------------------
  */
  newIndicator(indicator: Partial<Indicator>) {
    // this.newIndicators.update((prev) => [...prev, indicator as Indicator])
    this.iStore.update((state) => ({
      ...state,
      indicators: [indicator, ...state.indicators]
    }))
  }

  refreshIndicators() {
    this.projectsService
      .getOne(this.project().id ?? null, ['indicators', 'indicators.businessArea'])
      .subscribe((project) => {
        this.updateProject({
          indicators: project.indicators
        })
      })
  }

  getIndicatorByCode(code: string) {
    return this.indicators$.pipe(
      map((indicators) => indicators.find((indicator) => indicator.code === code)),
      distinctUntilChanged(),
      switchMap((indicator) =>
        indicator
          ? of(indicator)
          : this.project$.pipe(
              map((project) => project?.id),
              filter(nonBlank),
              take<string>(1),
              switchMap((projectId) =>
                this.indicatorsService.getByProject(projectId, { where: { code }, relations: ['createdBy'] })
              ),
              map(({ items }) => items[0]),
              catchError(() => of(null))
            )
      )
    )
  }

  getIndicatorById(id: string) {
    return this.indicatorsService.getById(id, ['createdBy'])
  }

  updateIndicator(indicator: Partial<Indicator>) {
    if (indicator.id) {
      this.iStore.update((state) => ({
        ...state,
        indicators: state.indicators.map((item) => (item.id === indicator.id ? { ...item, ...indicator } : item))
      }))
    }
  }

  markDirty(id: string, dirty: boolean) {
    this.dirty.update((state) => ({ ...state, [id]: dirty }))
  }

  resetIndicator(id: string) {
    this.iStore.update((state) => ({
      ...state,
      indicators: state.indicators.map((item) =>
        item.id === id ? cloneDeep(this.iPristineStore.getValue().indicators.find((i) => i.id === id)) : item
      )
    }))
    this.dirty.update((state) => ({ ...state, [id]: null }))
  }

  removeIndicator(id: string) {
    this.iStore.update((store) => ({
      ...store,
      indicators: store.indicators.filter((item) => item.id !== id)
    }))
  }

  async saveAll() {
    for await (const id of Object.keys(this.dirty())) {
      let indicator = this.iStore.getValue().indicators.find((item) => item.id === id)
      if (indicator) {
        try {
          if (!isUUID(indicator.id)) {
            delete indicator.id
          }
          indicator = await firstValueFrom(this.indicatorsService.create(indicator))
          this.iStore.update((state) => ({
            ...state,
            indicators: state.indicators.map((item) => (item.id === id ? cloneDeep(indicator) : item))
          }))
          this.iPristineStore.update((store) => ({
            ...store,
            indicators: store.indicators.map((item) => (item.id === id ? cloneDeep(indicator) : item))
          }))
          this.markDirty(id, false)
        } catch (error) {
          this.toastrService.error(getErrorMessage(error))
        }
      }
    }
  }
}
