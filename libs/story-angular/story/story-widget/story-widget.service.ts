import { computed, inject, Inject, Injectable, Optional } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ID } from '@metad/contracts'
import { AIOptions } from '@metad/copilot'
import { NgmCopilotService, WidgetService } from '@metad/core'
import { DataSettings } from '@metad/ocap-core'
import { ComponentSubStore } from '@metad/store'
import {
  LinkedAnalysisSettings,
  NX_STORY_FEED,
  NxStoryFeedService,
  StoryPointState,
  StoryWidget
} from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom, Observable } from 'rxjs'
import { filter, tap } from 'rxjs/operators'
import { NxStoryPointService } from '../story-point.service'

@Injectable()
export class NxStoryWidgetService extends ComponentSubStore<StoryWidget, StoryPointState> {
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

  readonly messages = computed(() => [])
  readonly conversations = computed(() => [])

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
    @Optional() private _snackBar?: MatSnackBar
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
      await firstValueFrom(
        this.feedService.createFeed({
          type: 'StoryWidget',
          entityId: widget.id,
          options: {
            storyId: widget.storyId,
            pageKey: storyPoint.key,
            widgetKey: widget.key
          }
        })
      )

      const pinSuccess = this.getTranslation('Story.Widget.PinSuccess', 'Widget pin success')
      this._snackBar?.open(pinSuccess, widget.name, { duration: 1000 })
    } catch (err) {
      const pinFailed = this.getTranslation('Story.Widget.PinFailed', 'Widget pin failed')
      this._snackBar?.open(pinFailed, widget.name, { duration: 1000 })
    }
  }

  getTranslation(code: string, text: string, params?) {
    let result = text
    this.translateService?.get(code, { Default: text, ...(params ?? {}) }).subscribe((value) => {
      result = value
    })

    return result
  }
}
