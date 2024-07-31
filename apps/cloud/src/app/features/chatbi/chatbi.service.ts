import { computed, inject, Injectable, signal } from '@angular/core'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { nanoid } from '@metad/copilot'
import { markdownModelCube } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType, isEntityType, isString } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, filter, firstValueFrom, Observable, switchMap, tap } from 'rxjs'
import { registerModel } from '../../@core'
import { ChatbiConverstion, QuestionAnswer } from './types'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable()
export class ChatbiService {
  readonly #modelsService = inject(ModelsService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)

  readonly models$ = this.#modelsService.getMy()

  readonly model = signal<NgmSemanticModel>(null)

  readonly error = signal<string>(null)
  readonly cube = signal<string>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})
  readonly dataSourceName = computed(() => getSemanticModelKey(this.model()))
  readonly modelId = computed(() => this.model()?.id)
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
  readonly conversationId = signal<string | null>(null)
  readonly conversation = computed(() => {
    return this.conversations()?.find((conv) => conv.id === this.conversationId())
  })

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
      ? markdownModelCube({ modelId: this.modelId(), dataSource: this.dataSourceName(), cube: this.entityType() })
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
    // this.conversation.update((state) => ({
    //   ...state,
    // }))
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
    this.model.set(model)
    this.setCube(model.cube)

    if (!this._suggestedPrompts()[this.dataSourceName()]) {
      this.registerModel(model)
    }
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  newConversation() {
    const conversation = {id: nanoid()} as ChatbiConverstion
    this.conversations.update((state) => [...state, conversation])
    this.setConversation(conversation.id)
  }

  setConversation(id: string) {
    this.conversationId.set(id)
  }

  deleteConversation(id: string) {
    this.conversations.update((state) => state.filter((conversation) => conversation.id!== id))
  }

  updateConversation(id: string, fn: (state: ChatbiConverstion) => ChatbiConverstion) {
    this.conversations.update((state) => {
      const index = state.findIndex((c) => c.id === id)
      if (index > -1) {
        state[index] = fn(state[index])
      }
      return [...state]
    })
  }

  addHumanMessage(message: string) {
    this.updateConversation(this.conversationId(), (state) => {
      return {
        ...state,
        name: state.name || message,
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
    this.updateConversation(this.conversationId(), (state) => {
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
  }

  updateQuestionAnswer(id: string, answer: QuestionAnswer) {
    this.updateConversation(this.conversationId(), (state) => {
      const index = state.messages.findIndex((message) => message.id === id)
      if (index > -1) {
        state.messages[index] = {
          ...state.messages[index],
          data: (<Array<any>>state.messages[index].data).map((item) => isString(item)? item : {
            ...item,
            ...answer,
            dataSettings: {
              ...answer.dataSettings,
              selectionVariant: null
            },
            slicers: answer.dataSettings.selectionVariant?.selectOptions ?? []
          })
        }
      }
      return {...state, messages: [...state.messages]}
    })
  }
}
