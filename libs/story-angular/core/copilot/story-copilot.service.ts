import { inject, Injectable, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  BusinessOperation,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatResponseChoice,
  CopilotEngine,
} from '@metad/copilot'
import { NgmCopilotService } from '@metad/core'
import { TranslateService } from '@ngx-translate/core'
import JSON5 from 'json5'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs'
import { NxStoryService } from '../story.service'
import { I18N_STORY_NAMESPACE } from '../types'
import { createStoryPage, discoverPageWidgets, logResult, smartDiscover } from './discover'

const Commands = [
  {
    command: 'story',
    description: 'New story',
  }
]


@Injectable()
export class StoryCopilotEngineService implements CopilotEngine {
  private copilotService = inject(NgmCopilotService)
  private storyService = inject(NxStoryService)
  private translateService = inject(TranslateService)
  private readonly logger = inject(NGXLogger)

  currentWidgetCopilot: CopilotEngine

  private readonly _prompts = toSignal(
    this.translateService.get(`${I18N_STORY_NAMESPACE}.Copilot.PredefinedPrompts`).pipe(
      map((i18n) => {
        return (
          i18n ?? [
            '/story Set story theme dark',
            '/story-style Set story gradient background color sense of technology',
            '/widget-style Set widget transparent background',
            '/chart Chart series set line smooth',
            '/chart Chart series set bar max width 20, rounded, shadow',
            '/chart Chart series add average mark line',
            '/chart Chart category axis line width 2, show axis tick',
            '/widget Data analysis'
          ]
        )
      })
    )
  )
  aiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as AIOptions
  conversations: CopilotChatMessage[]

  get prompts() {
    return this._prompts()
  }

  businessAreas = [
    {
      businessArea: '故事',
      action: 'story-style',
      prompts: {
        zhHans: '故事样式'
      },
      language: 'css',
      format: 'json'
    },
    {
      businessArea: '故事',
      action: 'StoryTheme',
      prompts: {
        zhHans: '故事主题'
      },
      value: ['light', 'dark', 'thin'],
      format: 'json'
    },
    {
      businessArea: '故事页面',
      action: 'StoryPageStyle',
      prompts: {
        zhHans: '页面样式'
      },
      language: 'css',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'WidgetStyle',
      prompts: {
        zhHans: '部件样式'
      },
      language: 'css',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartSeriesStyle',
      prompts: {
        zhHans: '图形系列'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartCategoryAxis',
      prompts: {
        zhHans: '图形分类轴'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartValueAxis',
      prompts: {
        zhHans: '图形值轴'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartLegend',
      prompts: {
        zhHans: '图例'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartTitle',
      prompts: {
        zhHans: '图形标题'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'ChartGrid',
      prompts: {
        zhHans: '图形网格'
      },
      language: 'ECharts',
      format: 'json'
    },
    {
      businessArea: '故事部件',
      action: 'DataAnalysis',
      prompts: {
        zhHans: '分析数据'
      },
      language: 'text',
      format: 'text'
    }
  ]

  get systemPrompt() {
    return `预设条件：${JSON.stringify({
      BusinessAreas: this.businessAreas
    })}
根据问题给出涉及到的多个 action 相应 language in format 的答案放在 value 属性，不用注释，不用额外属性，例如
问题：设置故事背景为渐变深色，组件边框圆角 20px
答案：[
  {
    "action": "StoryStyle",
    "value": {
      "background": "linear-gradient(45deg, black, transparent)"
    }
  },
  {
    "action": "WidgetStyle",
    "value": 
    {
      "border-radius": "20px"
    }
  }
]
`
  }

  private readonly dataSource = signal('rshEYUmoSJ')
  private readonly entity$ = new BehaviorSubject<string>('Sales')
  private readonly entityType = toSignal(this.entity$.pipe(
    switchMap((entity) => entity ? this.storyService.selectEntityType({dataSource: this.dataSource(), entitySet: entity}) : of(null))
  ))

  preprocess(prompt: string) {
    this.logger.debug(`Preprocess - Classify the problem: ${prompt}`)
    // a regex match `/command `
    const match = prompt.match(/^\/([a-zA-Z\-]*)\s+/i)
    const command = match?.[1]

    if (command === 'story') {
      return smartDiscover({
        dataSource: this.dataSource(),
        storyService: this.storyService,
        copilotService: this.copilotService,
        prompt,
        entityType: this.entityType(),
        options: this.aiOptions
      }).pipe(
        tap(logResult),
        switchMap(createStoryPage),
        switchMap(discoverPageWidgets),
        tap(logResult)
      )
    }
  
    return of(null)
  }

  async dataAnalysis(prompt: string, options?) {
    this.currentWidgetCopilot?.process({ prompt }, options)
  }

  process({ prompt }, options?: { action?: string }): Observable<string | CopilotChatMessage[]> {
    this.logger.debug(`process ask: ${prompt}`)

    return this.preprocess(prompt).pipe(
      switchMap(createStoryPage),
      map(() => {
        return 'OK'
      })
    )
  }

  postprocess(prompt: string, choices: CopilotChatResponseChoice[]) {
    let res
    try {
      res = JSON5.parse(choices[0].message.content)
      console.log(`====>>>>`, prompt, choices, res)
    } catch (err) {
      return of([
        {
          role: CopilotChatMessageRoleEnum.Assistant,
          content: choices[0].message.content
        }
      ])
    }

    if (!Array.isArray(res)) {
      if (res.action === 'DataAnalysis') {
        return of(prompt).pipe(
          switchMap(() => {
            return this.currentWidgetCopilot.process({ prompt }, { action: 'DataAnalysis' })
          })
        )
      }

      res = [res]
    }

    const messages = []
    res.forEach((operation: BusinessOperation) => {
      try {
        switch (operation.action) {
          case 'StoryTheme':
            this.storyService.updateStoryOptions({
              themeName: operation.value
            })
            break
          case 'StoryStyle':
            this.storyService.updateStoryStyles(operation.value)
            break
          case 'StoryPageStyle':
            this.storyService.updateStoryPointStyles(operation.value)
            break
          case 'WidgetStyle':
            this.storyService.updateWidgetStyles(operation.value)
            break
          case 'ChartSeriesStyle':
            this.storyService.updateStoryWidgetChartOptions('seriesStyle', operation.value)
            break
          case 'ChartCategoryAxis':
            this.storyService.updateStoryWidgetChartOptions('categoryAxis', operation.value)
            break
          case 'ChartValueAxis':
            this.storyService.updateStoryWidgetChartOptions('valueAxis', operation.value)
            break
          case 'ChartLegend':
            this.storyService.updateStoryWidgetChartOptions('legend', operation.value)
            break
          case 'ChartTitle':
            this.storyService.updateStoryWidgetChartOptions('title', operation.value)
            break
          case 'ChartGrid':
            this.storyService.updateStoryWidgetChartOptions('grid', operation.value)
            break
        }

        messages.push({
          role: CopilotChatMessageRoleEnum.Assistant,
          content:
            typeof operation === 'string'
              ? operation
              : `任务 **${
                  this.businessAreas.find((item) => item.action === operation.action)?.prompts.zhHans
                }** 执行完成`,
          end: true
        })
      } catch (err: any) {
        messages.push({
          role: CopilotChatMessageRoleEnum.Assistant,
          content: '',
          error: err.message,
          end: true
        })
      }
    })

    return of(messages)
  }
}
