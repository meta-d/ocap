import { computed, inject, Injectable, model, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { calcEntityTypePrompt, nonNullable } from '@metad/core'
import { NgmCopilotEngineService, NgmCopilotService } from '@metad/copilot-angular'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { Cube, EntityType, isEntityType } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { uniq } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { computedAsync } from 'ngxtension/computed-async'
import { combineLatest, debounceTime, filter, firstValueFrom, map, of, switchMap, tap } from 'rxjs'
import { registerModel } from '../../../@core'

@Injectable()
export class InsightService {
  readonly #modelsService = inject(ModelsService)
  readonly #copilotService = inject(NgmCopilotService)
  readonly #copilotEngine = inject(NgmCopilotEngineService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)
  readonly #translate = inject(TranslateService)
  readonly #logger = inject(NGXLogger)

  readonly language = toSignal(this.#translate.onLangChange.pipe(map(({ lang }) => lang)))

  get model(): NgmSemanticModel {
    return this.#model()
  }
  set model(value) {
    this.#model.set(value)
  }
  readonly #model = signal<NgmSemanticModel>(null)
  // private model$ = toObservable(this.#model)

  readonly dataSourceName = computed(() => getSemanticModelKey(this.#model()))

  readonly cube = model<Cube>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})

  readonly suggestedPrompts = computed(() => {
    return this._suggestedPrompts()[this.dataSourceName() + (this.cube()?.name ?? '')]
  })
  readonly suggesting = signal(false)

  readonly entityType = toSignal(
    combineLatest([toObservable(this.dataSourceName), toObservable(this.cube).pipe(map((cube) => cube?.name))]).pipe(
      debounceTime(100),
      filter(([key, cube]) => !!key && !!cube),
      switchMap(([key, cube]) =>
        this.#dsCoreService.selectEntitySet(key, cube).pipe(map((entitySet) => entitySet?.entityType))
      ),
      tap((entityType) => {
        if (entityType && !this._suggestedPrompts()[this.#cubeSuggestsKey()]) {
          setTimeout(async () => {
            await this.askSuggests()
          }, 100)
        }
      })
    )
  )

  readonly allCubes = computedAsync(() => {
    const dataSourceName = this.dataSourceName()

    return this.#dsCoreService
      .getDataSource(dataSourceName)
      .pipe(switchMap((dataSource) => (this.#model()?.schema?.cubes?.length ? dataSource.discoverMDCubes() : of([]))))
  })

  readonly #cubeSuggestsKey = computed(() => this.dataSourceName() + (this.cube()?.name ?? ''))

  readonly error$ = signal('')
  readonly answers$ = signal([])

  entityPromptLimit = 10

  readonly copilotEnabled = toSignal(this.#copilotService.enabled$)
  readonly models$ = this.#modelsService.getMy()

  readonly cubes$ = toObservable(this.dataSourceName).pipe(
    filter(nonNullable),
    switchMap((name) => this.#dsCoreService.getDataSource(name)),
    switchMap((dataSource) => dataSource.discoverMDCubes())
  )
  readonly cubes = toSignal(this.cubes$)
  readonly hasCube$ = computed(() => !!this.cubes()?.length)

  async setModel(model: NgmSemanticModel) {
    this.setCube(null)
    model = convertNewSemanticModelResult(
      await firstValueFrom(
        this.#modelsService.getById(model.id, ['indicators', 'createdBy', 'updatedBy', 'dataSource', 'dataSource.type'])
      )
    )
    this.#model.set(model)

    if (!this._suggestedPrompts()[this.dataSourceName()]) {
      this.registerModel(model)
      // const answer = await this.suggestPrompts()
      // this._suggestedPrompts.set({ ...this._suggestedPrompts(), [this.dataSourceName()]: answer.suggests })
    }
  }

  async setCube(cube: Cube) {
    this.error$.set(null)
    this.cube.set(cube)

    // if (cube && !this._suggestedPrompts()[this.#cubeSuggestsKey()]) {
    //   await this.askSuggests()
    // }
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  updateSuggests(suggests: string[]) {
    this._suggestedPrompts.update((state) => ({
      ...state,
      [this.#cubeSuggestsKey()]: suggests
    }))
  }

  async askCopilot(prompt: string, options?: { abortController: AbortController; conversationId: string }) {
    try {
      this.suggesting.set(true)
      await this.#copilotEngine.chat(`/chart ${prompt}`, {
        newConversation: true,
        assistantMessageId: options.conversationId,
        conversationId: options.conversationId
      })
    } catch (err) {
      this.#logger.error(err)
    } finally {
      this.suggesting.set(false)
    }
  }

  async askSuggests() {
    try {
      this.suggesting.set(true)
      await this.#copilotEngine.chat(`/suggest suggest ${this.entityPromptLimit} prompts for cube`, {
        newConversation: true
      })
    } catch (err) {
      this.#logger.error(err)
    } finally {
      this.suggesting.set(false)
    }
  }

  getCubesPromptInfo(entityTypes: EntityType[]) {
    return entityTypes.map((cube) => calcEntityTypePrompt(cube))
  }

  async getAllEntities() {
    const dataSourceName = this.dataSourceName()
    const dataSource = await firstValueFrom(this.#dsCoreService.getDataSource(dataSourceName))

    const entities = []
    if (this.model.schema?.cubes?.length) {
      const cubes = await firstValueFrom(dataSource.discoverMDCubes())
      entities.push(cubes.map((cube) => `"${cube.name}" ${cube.caption ?? ''}`))
    } else {
      const tables = await firstValueFrom(dataSource.discoverDBTables())
      entities.push(tables.map((item) => `"${item.name}" ${item.caption ?? ''}`))
    }

    return uniq(entities).join(', ')
  }

  /**
   * Get entity type by name
   *
   * @param name Entity name
   * @returns EntityType
   */
  async getEntityType(name: string) {
    const dataSourceName = this.dataSourceName()
    const dataSource = await firstValueFrom(this.#dsCoreService.getDataSource(dataSourceName))
    const entityType = await firstValueFrom(dataSource.selectEntityType(name))
    if (isEntityType(entityType)) {
      return entityType
    }

    throw entityType
  }

  clearError() {
    this.error$.set('')
  }

}
