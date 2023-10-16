import { CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { NgmCopilotService, calcEntityTypePrompt } from '@metad/core'
import { EntityType, omitBlank } from '@metad/ocap-core'
import { combineLatest, concat, from, of } from 'rxjs'
import { map, tap, switchMap } from 'rxjs/operators'
import { NxStoryService } from '../story.service'
import { StoryPointType, StoryWidget, WidgetComponentType, uuid } from '../types'
import { discoverStory, discoverWidgetChart, discoverWidgetGrid } from './schema'

export interface CopilotChartConversation {
  dataSource: string
  storyService: NxStoryService
  copilotService: NgmCopilotService
  prompt: string
  options: any
  entityType: EntityType
  response?: { arguments: any } | any
  error?: string | Error
}

/**
 * Create story dashboard that contains multiple story pages.
 *
 * @param prompt
 */
export function smartDiscover(copilot: CopilotChartConversation) {
  const { copilotService, prompt, entityType } = copilot

  const systemPrompt = `你是一名 BI 分析专家，请根据 Cube 信息和提问问题给出可以创建的几个分析主题页面. 每个页面内至少 4 个 widgets and these widgets must fullfill the layout of page which is 10 rows and 10 columns.
Widgets 之间要错落有致。
Cube is ${calcEntityTypePrompt(entityType)}`

  return copilotService
    .chatCompletions(
      [
        {
          role: CopilotChatMessageRoleEnum.System,
          content: systemPrompt
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: prompt
        }
      ],
      {
        ...discoverStory,
        ...omitBlank(copilot.options)
      }
    )
    .pipe(
      map(({ choices }) => {
        try {
          copilot.response = getFunctionCall(choices[0].message)
        } catch (err) {
          copilot.error = err as Error
        }
        return copilot
      })
    )
}

export function logResult(copilot: CopilotChartConversation) {
  console.log(`The result:`, copilot.response)
}

export function createStoryPage(copilot: CopilotChartConversation) {
  const { dataSource, storyService, response, entityType } = copilot
  const pages = response.arguments.pages

  return concat<CopilotChartConversation[]>(
    ...pages.map((page) => {
      const pageKey = uuid()
      const widgets = page.widgets?.map((widget) => {
        return {
          ...widget,
          key: uuid(),
          dataSettings: {
            dataSource,
            entitySet: entityType.name,
          }
        }
      })
      return from(
        storyService.newStoryPage({
          key: pageKey,
          type: StoryPointType.Canvas,
          name: page.title,
          gridOptions: {
            gridType: 'fit',
            minCols: 10,
            minRows: 10
          },
          widgets
        })
      ).pipe(
        map((page) => ({...copilot, response: page})),
        switchMap(discoverPageWidgets)
      )
    })
  )
}

/**
 * Concurrently create widgets in the page
 * 
 * @param copilot 
 * @returns 
 */
export function discoverPageWidgets(copilot: CopilotChartConversation) {
  const { copilotService, storyService, response: page, entityType } = copilot
  return page.widgets?.length
    ? combineLatest(page.widgets.map((widget) => chatStoryWidget(copilot, widget))).pipe(
        map(() => copilot)
      )
    : of(copilot)
}

/**
 * Chat with copilot to create a widget in the page
 * 
 * @param copilot 
 * @param widget 
 * @returns 
 */
export function chatStoryWidget(copilot: CopilotChartConversation, widget: StoryWidget) {
  const { copilotService, storyService, response: page, entityType } = copilot

  const componentType = widget.component

  const systemPrompt = `你是一名 BI 分析专家，请根据 Cube 信息和描述填写 ${componentType} 组件配置。
Dimension 是由三个属性组成的，分别是：dimension name, hierarchy name, level name. Value of these three attributes name contain '[]' symbol.
The cube is ${calcEntityTypePrompt(entityType)}`

  return copilotService
    .chatCompletions(
      [
        {
          role: CopilotChatMessageRoleEnum.System,
          content: systemPrompt
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: `This widget is '${widget.title}'`
        }
      ],
      {
        ...(componentType === WidgetComponentType.AnalyticalCard ? discoverWidgetChart : discoverWidgetGrid),
        ...omitBlank(copilot.options)
      }
    )
    .pipe(
      map(({ choices }) => {
        try {
          return getFunctionCall(choices[0].message)
        } catch (err) {
          throw new Error('Error when parse the response of discover widget')
        }
      }),
      tap((response) => {
        console.log(`The widget response is`, response.arguments)
        const dataSettings = {} as any
        if (componentType === WidgetComponentType.AnalyticalCard) {
          dataSettings.chartAnnotation = {
            ...response.arguments
          }
        } else {
          dataSettings.analytics = {
            ...response.arguments
          }
        }

        storyService.updateWidget({
          pageKey: page.key,
          widgetKey: widget.key,
          widget: {
            ...widget,
            // ...response.arguments,
            dataSettings: {
              ...widget.dataSettings,
              ...dataSettings
            }
          }
        })
      })
    )
}
