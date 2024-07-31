import { computed, effect, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { nanoid } from '@metad/copilot'
import { markdownModelCube } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType, isEntityType, isString } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, debounceTime, filter, firstValueFrom, map, Observable, pairwise, switchMap, tap } from 'rxjs'
import { ChatBIConversationService, ChatbiConverstion, registerModel } from '../../@core'
import { QuestionAnswer } from './types'

@Injectable()
export class ChatbiService {
  readonly #modelsService = inject(ModelsService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)
  readonly conversationService = inject(ChatBIConversationService)

  readonly models$ = this.#modelsService.getMy()

  readonly detailModels = signal<Record<string, NgmSemanticModel>>({})
  // readonly model = signal<NgmSemanticModel>(null)

  readonly error = signal<string>(null)
  readonly cube = signal<string>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})
  readonly _modelId = computed(() => this.conversation()?.modelId)
  readonly _model = computed(() => this.detailModels()[this._modelId()])
  readonly dataSourceName = computed(() => getSemanticModelKey(this._model()))
  // readonly modelId = computed(() => this.model()?.id)
  readonly #loadingCubes$ = new BehaviorSubject(false)
  readonly loadingCubes = toSignal(this.#loadingCubes$)

  readonly cubes = derivedAsync(() => {
    const dataSourceName = this.dataSourceName()
    if (dataSourceName) {
      return this.#dsCoreService.getDataSource(dataSourceName).pipe(
        tap(() => this.#loadingCubes$.next(true)),
        switchMap((dataSource) => dataSource.discoverMDCubes()),
        tap(() => this.#loadingCubes$.next(false))
      )
    }
    return null
  })

  readonly conversations = signal<ChatbiConverstion[]>([])
  readonly conversationId = signal<string | null>(null)
  readonly conversationKey = signal<string | null>(null)
  readonly conversation = computed(() => {
    return this.conversations()?.find((conv) => conv.key === this.conversationKey())
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
      ? markdownModelCube({ modelId: this._modelId(), dataSource: this.dataSourceName(), cube: this.entityType() })
      : ''
  )

  readonly dataSettings = computed(() => {
    const dataSource = this.dataSourceName()
    const entitySet = this.cube()
    if (dataSource && entitySet) {
      return {
        dataSource,
        entitySet
      }
    }
    return null
  })

  readonly pristineConversation = signal<ChatbiConverstion | null>(null)

  private allSub = this.conversationService
    .getMy()
    .pipe(takeUntilDestroyed())
    .subscribe((items) => {
      if (items.length) {
        this.conversations.update((state) => [...state, ...items.filter((item) => !state.some((conv) => conv.key === item.key))])
        if (!this.conversationId()) {
          this.setConversation(items[0].key)
        }
      } else {
        this.newConversation()
      }
    })

  private saveSub = toObservable(this.conversation)
    .pipe(
      pairwise(),
      map(([prev, curr]) => {
        // Set pristine conversation when changed to new one.
        if (prev?.key !== curr?.key) {
          this.pristineConversation.set(curr)
        }
        return curr
      }),
      debounceTime(1000 * 10),
      filter((conversation) => conversation !== this.pristineConversation()),
      switchMap((conversation) => this.conversationService.upsert(conversation)),
      takeUntilDestroyed()
    )
    .subscribe((conversation) => {
      this.pristineConversation.set(conversation)
      this.updateConversation(conversation.key, (state) => {
        return conversation
      })
    })

  constructor() {
    effect(async () => {
      if (this._modelId() && !this._model()) {
        const model = convertNewSemanticModelResult(
          await firstValueFrom(
            this.#modelsService.getById(this._modelId(), ['indicators', 'createdBy', 'updatedBy', 'dataSource', 'dataSource.type'])
          )
        )
        this.detailModels.update((state) => ({...state, [model.id]: model}))
        this.registerModel(model)
        this.setCube(model.cube)
      }
    }, { allowSignalWrites: true })
  }

  setCube(cube: string) {
    this.error.set(null)
    this.cube.set(cube)
  }

  async setModel(model: NgmSemanticModel) {
    this.updateConversation(this.conversationKey(), (state) => ({...state, modelId: model.id}))
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  newConversation() {
    const conversation = { key: nanoid() } as ChatbiConverstion
    this.conversations.update((state) => [...state, conversation])
    this.setConversation(conversation.key)
  }

  setConversation(key: string) {
    this.conversationKey.set(key)
  }

  addConversation(conversation: ChatbiConverstion) {
    if (!this.conversations().some((item) => item.key === conversation.key)) {
      this.conversations.update((state) => [...state, conversation])
    }
    this.conversationKey.set(conversation.key)
  }

  deleteConversation(key: string) {
    const conversation = this.conversations().find((item) => item.key === key)
    this.conversations.update((state) => state.filter((conversation) => conversation.key !== key))
    if (key === this.conversationKey()) {
      this.conversationKey.set(this.conversations()[this.conversations().length - 1]?.key)
    }
    if (conversation.id) {
      this.conversationService.delete(conversation.id).subscribe({
        error: (err) => {
        }
      })
    }
  }

  updateConversation(key: string, fn: (state: ChatbiConverstion) => ChatbiConverstion) {
    this.conversations.update((state) => {
      const index = state.findIndex((c) => c.key === key)
      if (index > -1) {
        state[index] = fn(state[index])
      }
      return [...state]
    })
  }

  addHumanMessage(message: string) {
    this.updateConversation(this.conversationKey(), (state) => {
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
    this.updateConversation(this.conversationKey(), (state) => {
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

  updateQuestionAnswer(key: string, answer: QuestionAnswer) {
    this.updateConversation(this.conversationKey(), (state) => {
      const index = state.messages.findIndex((message) => message.id === key)
      if (index > -1) {
        state.messages[index] = {
          ...state.messages[index],
          data: (<Array<any>>state.messages[index].data).map((item) =>
            isString(item)
              ? item
              : {
                  ...item,
                  ...answer,
                  dataSettings: {
                    ...answer.dataSettings,
                    selectionVariant: null
                  },
                  slicers: answer.dataSettings.selectionVariant?.selectOptions ?? []
                }
          )
        }
      }
      return { ...state, messages: [...state.messages] }
    })
  }
}
