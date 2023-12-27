import { inject, Inject, Injectable, Optional } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ID } from '@metad/contracts'
import { AIOptions, CopilotChatMessage, CopilotChatMessageRoleEnum, CopilotChatResponseChoice, CopilotEngine } from '@metad/copilot'
import { DataSettings } from '@metad/ocap-core'
import { ComponentSubStore } from '@metad/store'
import { TranslateService } from '@ngx-translate/core'
import { convertQueryResultColumns, convertTableToCSV, NgmCopilotService, WidgetService } from '@metad/core'
import { NxStoryFeedService, NX_STORY_FEED, StoryPointState, StoryWidget, LinkedAnalysisSettings } from '@metad/story/core'
import { firstValueFrom, Observable, of } from 'rxjs'
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { NxStoryPointService } from '../story-point.service'
import { nanoid } from 'ai'

@Injectable()
export class NxStoryWidgetService extends ComponentSubStore<StoryWidget, StoryPointState> implements CopilotEngine {
  private widgetService = inject(WidgetService)
  readonly copilot? = inject(NgmCopilotService, { optional: true })

  get widget() {
    return this.get((state) => state)
  }

  aiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as AIOptions
  systemPrompt: string
  prompts: string[]
  conversations: CopilotChatMessage[]

  readonly dataSettings$ = this.select((state) => state.dataSettings).pipe(
    filter<DataSettings>(Boolean),
    filter<DataSettings>((dataSettings) => !!dataSettings.entitySet)
  )

  readonly linkedAnalysis$ = this.select((state) => state.linkedAnalysis)

  constructor(
    private readonly storyPointService: NxStoryPointService,
    @Optional()
    @Inject(NX_STORY_FEED)
    private feedService?: NxStoryFeedService,
    @Optional() private translateService?: TranslateService,
    @Optional() private _snackBar?: MatSnackBar,
  ) {
    super({} as any)
  }

  readonly init = this.effect((id$: Observable<ID>) => {
    return id$.pipe(
      tap((id: ID) =>
        this.connect(this.storyPointService, {
          parent: ['widgets', id as string],
          arrayKey: 'key'
        })
      )
    )
  })

  readonly setLinkedAnalysis = this.updater((state, linkedAnalysis: LinkedAnalysisSettings) => {
    state.linkedAnalysis = linkedAnalysis
  })

  readonly updateStyling = this.updater((state, styling: StoryWidget['styling']) => {
    state.styling = {
      ...(state.styling ?? {}),
      ...styling
    }
  })

  readonly bringForward = this.updater((state, maxLayerIndex: number) => {
    state.position.layerIndex = Math.min(maxLayerIndex, (state.position.layerIndex ?? 0) + 1)
  })
  readonly bringFront = this.updater((state, maxLayerIndex: number) => {
    state.position.layerIndex = maxLayerIndex
  })
  readonly sendBackward = this.updater((state, baseLayerIndex: number) => {
    state.position.layerIndex = Math.max(baseLayerIndex, (state.position.layerIndex ?? 0) - 1)
  })
  readonly sendBack = this.updater((state, baseLayerIndex: number) => {
    state.position.layerIndex = baseLayerIndex
  })

  async pin() {
    const widget = this.widget
    const storyPoint = this.storyPointService.storyPoint
    if (!this.feedService) {
      throw new Error(`Not provide feed service`)
    }

    try {
      await firstValueFrom(this.feedService.createFeed({
        type: 'StoryWidget',
        entityId: widget.id,
        options: {
          storyId: widget.storyId,
          pageKey: storyPoint.key,
          widgetKey: widget.key
        }
      }))

      const pinSuccess = this.getTranslation('Story.Widget.PinSuccess', 'Widget pin success')
      this._snackBar?.open(pinSuccess, widget.name, { duration: 1000 })
    } catch(err) {
      const pinFailed = this.getTranslation('Story.Widget.PinFailed', 'Widget pin failed')
      this._snackBar?.open(pinFailed, widget.name, { duration: 1000 })
    }
  }

  
  getTranslation(code: string, text: string, params?) {
    let result = text
    this.translateService?.get(code, {Default: text, ...(params ?? {})}).subscribe((value) => {
      result = value
    })

    return result
  }

  async preprocess(prompt: string, options?: { signal?: AbortSignal }): Promise<CopilotChatMessage[]> {
    return []
  }

  process({prompt}, options?: {action: string}) {
    return of(prompt).pipe(
      switchMap(async () => {
        const explains = this.widgetService.explains()
        return explains[1]
      }),
      switchMap((explain) => {
        if(!explain?.data) {
          return of([
            {
              id: nanoid(),
              role: CopilotChatMessageRoleEnum.Assistant,
              content: '未能获取相关数据'
            }
          ])
        }

        return this.copilot.chatStream([
          {
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.System,
            content: `你是一名 BI 数据分析专家，根据以下数据给出用户问题的分析：
${convertTableToCSV(convertQueryResultColumns(explain.schema), explain.data)}
`
          },
          {
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.User,
            content: prompt
          }
        ])
        .pipe(
          scan((acc, value: any) => acc + (value?.choices?.[0]?.delta?.content ?? ''), ''),
          map((content) => content.trim()),
          startWith([
            {
              id: nanoid(),
              role: CopilotChatMessageRoleEnum.Info,
              content: '正在分析。。。'
            }
          ])
        )
      })
    )
  }

  postprocess(prompt: string, choices: CopilotChatResponseChoice[]): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }
}
