import { CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt } from '@metad/core'
import { DataSettings, assignDeepOmitBlank, cloneDeep, omit, omitBlank } from '@metad/ocap-core'
import { StoryCopilotChatConversation, StoryWidget, WidgetComponentType, fixDimension } from '@metad/story/core'
import { map, of, switchMap } from 'rxjs'
import { editWidgetControl } from './schema'

export function chatControlWidget(copilot: StoryCopilotChatConversation, widget?: StoryWidget) {
  const { logger, copilotService, prompt, entityType } = copilot

  const systemPrompt = `You are a BI analysis expert, please edit or new the input control widget configuration based on the cube information and the question.
One dimension can only be used once. one hierarchy can't appears in more than one independent axis.
The cube is ${calcEntityTypePrompt(entityType)}.
Original widget is ${JSON.stringify(widget)}`

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
        ...editWidgetControl,
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

export function editControlWidgetCommand(copilot: StoryCopilotChatConversation) {
  const { logger, storyService, entityType } = copilot

  const widget = storyService.currentWidget()
  const page = storyService.currentPage()

  logger?.debug(`Original control widget is`, widget, page)

  const widgetKey = widget?.key
  const pageKey = page?.key

  return chatControlWidget(copilot, widget).pipe(
    switchMap((copilot) => {
      const { response, dataSource } = copilot
      const { arguments: anwser } = response

      logger?.debug(`Edit control widget anwser is`, anwser)

      if (widgetKey) {
        storyService.updateWidget({
          pageKey,
          widgetKey,
          widget: {
            ...omit(anwser, 'dimension'),
            dataSettings: assignDeepOmitBlank(cloneDeep(widget.dataSettings), {
              ...(anwser.dataSettings ?? {}),
              dimension: fixDimension(anwser.dimension, entityType)
            }, 5)
          }
        })
      } else {
        storyService.createStoryWidget({
          component: WidgetComponentType.InputControl,
          title: anwser.title,
          position: anwser.position,
          dataSettings: {
            dataSource,
            entitySet: entityType.name,
            dimension: fixDimension(anwser.dimension, entityType)
          } as DataSettings,
          options: anwser.options
        })
      }

      return of(copilot)
    })
  )
}
