import { inject } from '@angular/core'
import { calcEntityTypePrompt } from '@metad/core'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { EntityType } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'

export function injectStoryPageCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  let dataSourceName: string | null = null
  let defaultCube: EntityType | null = null

  return injectCopilotCommand({
    name: 'page',
    description: storyService.translate('Story.Copilot.StoryPageCommandDesc', {
      Default: 'Describe the new page of story you want'
    }),
    systemPrompt: async () => {
      let prompt = `You are a BI analysis expert. Please provide one analysis theme page that can be created based on the cube information and the question.
Each page should have at least 4 widgets and one or more input control widgets and these widgets must fullfill the layout of page which is 10 rows and 10 columns.
Widgets should be arranged in a staggered manner.
`
      if (defaultCube) {
        prompt += `The cube is:
\`\`\`
${calcEntityTypePrompt(defaultCube)}
\`\`\`
`
      } else {
        prompt += 'Please pick a default cube firstly.'
      }
      return prompt
    },
    actions: [
      // injectMakeCopilotActionable({
      //   name: 'new_story_page',
      //   description: '',
      //   argumentAnnotations: [
      //     {
      //       name: 'page',
      //       type: 'object',
      //       description: 'Page config',
      //       properties: zodToProperties(StoryPageSchema),
      //       required: true
      //     },
      //     {
      //       name: 'widgets',
      //       type: 'array',
      //       description: 'Widgets in page config',
      //       items: {
      //         type: 'object',
      //         properties: zodToProperties(StoryWidgetSchema)
      //       },
      //       required: true
      //     }
      //   ],
      //   implementation: async (page, widgets) => {
      //     logger.debug(`Function calling 'new_story_page', params is:`, page, widgets)
      //     storyService.newStoryPage({
      //       ...page,
      //       type: StoryPointType.Canvas,
      //       // widgets: widgets.map((item) => schemaToWidget(item, dataSourceName, defaultCube))
      //     })
      //     return `✅ ${storyService.translate('Story.Copilot.InstructionExecutionComplete', {
      //       Default: 'Instruction Execution Complete'
      //     })}`
      //   }
      // })
    ]
  })
}
