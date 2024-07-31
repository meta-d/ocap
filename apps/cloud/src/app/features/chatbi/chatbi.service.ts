import { computed, inject, Injectable, signal } from '@angular/core'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { nanoid } from '@metad/copilot'
import { markdownModelCube } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType, isEntityType } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, filter, firstValueFrom, Observable, switchMap, tap } from 'rxjs'
import { registerModel } from '../../@core'
import { ChatbiConverstion } from './types'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable()
export class ChatbiService {
  readonly #modelsService = inject(ModelsService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)

  readonly models$ = this.#modelsService.getMy()

  readonly #model = signal<NgmSemanticModel>(null)
  readonly error = signal<string>(null)
  readonly cube = signal<string>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})
  readonly dataSourceName = computed(() => getSemanticModelKey(this.#model()))
  readonly #loadingCubes$ = new BehaviorSubject(false)
  readonly loadingCubes = toSignal(this.#loadingCubes$)

  readonly cubes = derivedAsync(() => {
    const dataSourceName = this.dataSourceName()
    if (dataSourceName) {
      return this.#dsCoreService
        .getDataSource(dataSourceName)
        .pipe(
          tap(() => this.#loadingCubes$.next(true)),
          switchMap((dataSource) => dataSource.discoverMDCubes()),
          tap(() => this.#loadingCubes$.next(false))
        )
    }
    return null
  })

  readonly conversations = signal<ChatbiConverstion[]>([])
  readonly conversation = signal<ChatbiConverstion>(null)

  readonly entityType = derivedAsync<EntityType>(() => {
    const dataSourceName = this.dataSourceName()
    const cube = this.cube()
    if (dataSourceName && cube) {
      return this.#dsCoreService.getDataSource(dataSourceName).pipe(
        switchMap((dataSource) => dataSource.selectEntityType(cube)),
        filter((entityType) => isEntityType(entityType))
      ) as Observable<EntityType>
    }

    return null
  })

  readonly context = computed(() =>
    this.entityType()
      ? markdownModelCube({ modelId: '', dataSource: this.dataSourceName(), cube: this.entityType() })
      : ''
  )

  readonly dataSettings = computed(() => {
    const dataSource = this.dataSourceName()
    const entitySet = this.cube()
    if (dataSource && entitySet) {
      return {
        dataSource,
        entitySet,
      }
    }
    return null
  })

  constructor() {
    this.newConversation()
    this.conversation.update((state) => ({
      ...state,
      messages: [
        {
            "id": "mp5UV7ktZNSHKkqdA1sWf",
            "role": "user",
            "content": "2023年每个销售国家的销售额",
            "createdAt": new Date()
        },
        {
            "id": "-yYQI8GrHenbQuPjdSkFL",
            "role": "assistant",
            "content": "",
            "data": [
                "以下是2023年每个销售国家的销售额：",
                {
                    "dataSettings": {
                        "dataSource": "SalesDataSource",
                        "entitySet": "SalesCube",
                        "chartAnnotation": {
                            "chartType": {
                                "type": "Bar",
                                "orient": "horizontal",
                                "variant": "none"
                            },
                            "dimensions": [
                                {
                                    "dimension": "[销售国家]",
                                    "zeroSuppression": true,
                                    "chartOptions": {
                                        "dataZoom": {
                                            "type": "inside"
                                        }
                                    }
                                }
                            ],
                            "measures": [
                                {
                                    "dimension": "Measures",
                                    "measure": "销售额",
                                    "chartOptions": {},
                                    "formatting": {
                                        "shortNumber": true
                                    },
                                    "palette": {
                                        "name": "Viridis"
                                    }
                                }
                            ]
                        },
                        "presentationVariant": {
                            "groupBy": []
                        }
                    }
                }
            ],
            "createdAt": new Date()
        }
    ]
    }))
  }

  setCube(cube: string) {
    this.error.set(null)
    this.cube.set(cube)
  }

  async setModel(model: NgmSemanticModel) {
    model = convertNewSemanticModelResult(
      await firstValueFrom(
        this.#modelsService.getById(model.id, ['indicators', 'createdBy', 'updatedBy', 'dataSource', 'dataSource.type'])
      )
    )
    this.#model.set(model)
    this.setCube(model.cube)

    if (!this._suggestedPrompts()[this.dataSourceName()]) {
      this.registerModel(model)
    }
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  newConversation() {
    const conversation = {
      
    } as ChatbiConverstion
    this.conversations.update((state) => [...state, conversation])
    this.conversation.set(conversation)
  }

  addHumanMessage(message: string) {
    this.conversation.update((state) => {
      return {
        ...state,
        messages: [
          ...(state.messages ?? []),
          {
            id: nanoid(),
            role: 'user',
            content: message,
            createdAt: new Date()
          }
        ]
      }
    })
  }

  addAiMessage(data: any[]) {
    this.conversation.update((state) => {
      return {
        ...state,
        messages: [
          ...(state.messages ?? []),
          {
            id: nanoid(),
            role: 'assistant',
            content: '',
            data,
            createdAt: new Date()
          }
        ]
      }
    })

    console.log(this.conversation())
  }
}
