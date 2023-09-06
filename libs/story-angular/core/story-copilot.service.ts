import { inject, Injectable } from '@angular/core'
import { AIOptions, BusinessOperation, CopilotChatMessage, CopilotChatMessageRoleEnum, CopilotEngine } from '@metad/copilot'
import { UntilDestroy } from '@ngneat/until-destroy'
import { NgmCopilotService } from '@metad/core'
import { CreateChatCompletionResponseChoicesInner } from 'openai'
import JSON5 from 'json5'
import { NxStoryService } from './story.service'
import { Observable, of, switchMap } from 'rxjs'

@UntilDestroy({ checkProperties: true })
@Injectable()
export class StoryCopilotEngineService implements CopilotEngine {
  private copilotService = inject(NgmCopilotService)
  private storyService = inject(NxStoryService)
  
  currentWidgetCopilot: CopilotEngine
  
  prompts = [
    'Set story theme dark',
    'Set story gradient background color sense of technology',
    'Set widget transparent background',
    'Chart series set line smooth',
    'Chart series set bar max width 20, rounded, shadow',
    'Chart series add average mark line',
    'Chart category axis line width 2, show axis tick',
    'Data analysis',
  ]
  aiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as AIOptions
  conversations: CopilotChatMessage[]

  businessAreas = [
    {
      businessArea: '故事',
      action: 'StoryStyle',
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

  // async process(prompt: string, options?: { signal?: AbortSignal }): Promise<CopilotChatMessage[]> {
  //   return await this.postprocess(prompt, [])
  // }

  async preprocess(prompt: string) {
    return [
      {
        role: CopilotChatMessageRoleEnum.System,
        content: this.systemPrompt
      },
      {
        role: CopilotChatMessageRoleEnum.User,
        content: `请回答
问题：${prompt}
答案：`
      }
    ]
  }

  async dataAnalysis(prompt: string, options?) {
    this.currentWidgetCopilot?.process({prompt}, options)
  }

  process({prompt}, options?: { action?: string; }): Observable<string | CopilotChatMessage[]> {
    return of(prompt)
      .pipe(
        switchMap(async () => {
          const choices = await this.copilotService.createChat(await this.preprocess(prompt), {
            ...(options ?? {}),
            request: {
              temperature: 0.2
            }
          })

          return choices
        }),
        switchMap((choices) => this.postprocess(prompt, choices))
      )
  }

  postprocess(
    prompt: string,
    choices: CreateChatCompletionResponseChoicesInner[]
  ) {
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
            return this.currentWidgetCopilot.process({prompt}, {action: 'DataAnalysis'})
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
