import { Injectable, computed, inject, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { BusinessAreasService, IndicatorsService, NgmSemanticModel, hierarchizeBusinessAreas } from '@metad/cloud/state'
import { nonBlank } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { Indicator, MDCube, isEntitySet } from '@metad/ocap-core'
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
import { IProject, ISemanticModel, ProjectsService, TagService, registerModel } from '../../@core'
import { injectFetchModelDetails } from './types'

@Injectable()
export class ProjectService {
  readonly projectsService = inject(ProjectsService)
  readonly indicatorsService = inject(IndicatorsService)
  readonly businessAreasStore = inject(BusinessAreasService)
  readonly tagService = inject(TagService)
  readonly dsCoreService = inject(NgmDSCoreService)
  readonly wasmAgent = inject(WasmAgentService)
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
  readonly newIndicators = signal<Indicator[]>([])
  readonly newIndicators$ = toObservable(this.newIndicators)

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
    this.newIndicators.update((prev) => [...prev, indicator as Indicator])
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
    return this.newIndicators$.pipe(
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
    if (indicator.code) {
      this.newIndicators.update((indicators) => {
        const index = indicators.findIndex((item) => item.code === indicator.code)
        if (index > -1) {
          indicators[index] = { ...indicators[index], ...indicator }
        }
        return [...indicators]
      })
    }
  }
}
