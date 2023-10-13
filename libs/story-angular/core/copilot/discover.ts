import { CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { NgmCopilotService, calcEntityTypePrompt } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { Observable, combineLatest, concat, from, of } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { NxStoryService } from '../story.service'
import { StoryPointType, uuid } from '../types'
import { discoverStory, discoverStoryPage, discoverStoryWidget } from './schema'

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
        model: 'gpt-3.5-turbo-0613'
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

// export function smartDiscoverStoryPages(copilot: CopilotChartConversation): Observable<CopilotChartConversation> {
//   const { copilotService, prompt, entityType, response } = copilot

//   console.log(`discover-story-pages pre result:`, response)

//   return concat<CopilotChartConversation[]>(
//     ...response.arguments.pages.map((page) => {
//       const systemPrompt = `你是一名 BI 分析专家，请根据 Cube 信息和 story page title and description 创建页面，页面内至少 4 个 widgets and these widgets must fullfill the layout of page which is 10 rows and 10 columns.
// Dimension 是由三个属性组成的，分别是：dimension name, hierarchy name, level name. Value of these three attributes name contain '[]' symbol.
// The cube is ${calcEntityTypePrompt(entityType)}`
//       return copilotService
//         .chatCompletions(
//           [
//             {
//               role: CopilotChatMessageRoleEnum.System,
//               content: systemPrompt
//             },
//             {
//               role: CopilotChatMessageRoleEnum.User,
//               content: JSON.stringify(page)
//             }
//           ],
//           {
//             ...discoverStoryPage
//           }
//         )
//         .pipe(
//           map(({ choices }) => {
//             try {
//               copilot.response = getFunctionCall(choices[0].message)
//             } catch (err) {
//               copilot.error = err as Error
//             }
//             return copilot
//           })
//         )
//     })
//   )
// }

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
          key: uuid()
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
      )
    })
  )
}

export function discoverPageWidgets(copilot: CopilotChartConversation) {
  const { copilotService, storyService, response: page, entityType } = copilot
  return page.widgets?.length
    ? combineLatest(
        page.widgets.map((widget) => {

          const systemPrompt = `你是一名 BI 分析专家，请根据 Cube 信息和描述补全 widget。 The widget is ${JSON.stringify(widget)}.
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
                  ...discoverStoryWidget
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
                  console.log(`The widget is`, response.arguments)
                  storyService.updateWidget({
                    pageKey: page.key,
                    widgetKey: widget.key,
                    widget: {
                      ...widget,
                      ...response.arguments,
                    }
                  })
                })
              )
        })
      ).pipe(
        map(() => copilot)
      )
    : of(copilot)
}
