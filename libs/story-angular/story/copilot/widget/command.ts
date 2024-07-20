import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateWidgetAgent } from './graph'

export function injectStoryWidgetCommand() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)
  const currentWidget = storyService.currentWidget
  const currentStoryPoint = storyService.currentStoryPoint

  const createGraph = injectCreateWidgetAgent()

  const commandName = 'widget'
  return injectCopilotCommand(commandName, {
    alias: 'w',
    description: 'Describe the widget you want',
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    createGraph
  })
}

// /**
//  * Edit styles for chart widget
//  *
//  * @param storyService
//  * @returns
//  */
// export function injectWidgetStyleCommand(storyService: NxStoryService) {
//     const logger = inject(NGXLogger)
//     const translate = inject(TranslateService)

//     const currentWidget = storyService.currentWidget
//     const currentStoryPoint = storyService.currentStoryPoint

//     const tools = [...createUpdateChartTools(storyService)]

//     return injectCopilotCommand('chartStyle', {
//       alias: 'cs',
//       description: 'How to style the chart widget you want',
//       agent: {
//         type: CopilotAgentType.Default
//       },
//       systemPrompt: async () => {
//         if (!currentWidget()) {
//           throw new Error(
//             translate.instant('Story.Copilot.PleaseSelectWidget', { Default: 'Please select a widget first.' })
//           )
//         }

//         logger.debug(
//           `[Story] [AI Command] [ws] original widget:`,
//           currentWidget()?.title,
//           ' on page:',
//           currentStoryPoint()?.name
//         )
//         return `Original widget is:
//   \`\`\`
//   ${JSON.stringify(currentWidget() ?? 'empty')}
//   \`\`\`
//   `
//       },
//       tools,
//       prompt: ChatPromptTemplate.fromMessages([
//         [
//           'system',
//           `You are a BI analysis expert, please edit chart configuration for the widget based on user question.
//   {system_prompt}
//   `
//         ],
//         new MessagesPlaceholder({
//           variableName: 'chat_history',
//           optional: true
//         }),
//         ['user', '{input}'],
//         new MessagesPlaceholder('agent_scratchpad')
//       ])
//     })
//   }
