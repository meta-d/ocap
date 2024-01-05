import { inject } from '@angular/core'
import { calcEntityTypePrompt, zodToProperties } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { StoryWidgetSchema } from './schema'
import { StoryPageSchema } from './schema/page.schema'
import { firstValueFrom } from 'rxjs'
import { EntityType } from '@metad/ocap-core'
import { nanoid } from 'nanoid'

export function injectStoryPageCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  let defaultCube: EntityType | null = null

  return injectCopilotCommand({
    name: 'page',
    description: storyService.translate('Story.Copilot.StoryPageCommandDesc', {
      Default: 'Describe the new page of story you want'
    }),
    systemPrompt: () => {
      let prompt = `You are a BI analysis expert. Please provide one analysis theme page that can be created based on the cube information and the question.
Each page should have at least 4 widgets and one or more input control widgets and these widgets must fullfill the layout of page which is 10 rows and 10 columns.
Widgets should be arranged in a staggered manner.
If we not provide cube info, please pick a default cube.
`
      if (defaultCube) {
        prompt += `The cube is:
\`\`\`
${calcEntityTypePrompt(defaultCube)}
\`\`\`
`
      }
      return prompt
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'pick_default_cube',
        description: 'Pick a default cube',
        argumentAnnotations: [],
        implementation: async () => {
          const result = await storyService.openDefultDataSettings()
          logger.debug(`Pick the default cube is:`, result)
          if (result?.dataSource && result?.entities[0]) {
            const entityType = await firstValueFrom(storyService.selectEntityType({dataSource: result.dataSource, entitySet: result.entities[0]}))
            defaultCube = entityType
          }
          return {
            id: nanoid(),
            role: 'function',
            content: `The cube is:
\`\`\`
${calcEntityTypePrompt(defaultCube)}
\`\`\`
`
          }
        }
      }),
      injectMakeCopilotActionable({
        name: 'new_story_page',
        description: '',
        argumentAnnotations: [
          {
            name: 'page',
            type: 'object',
            description: 'Page config',
            properties: zodToProperties(StoryPageSchema),
            required: true
          },
          {
            name: 'widgets',
            type: 'array',
            description: 'Widgets in page config',
            items: {
              type: 'object',
              properties: zodToProperties(StoryWidgetSchema)
            },
            required: true
          }
        ],
        implementation: async (page, widgets) => {
          logger.debug(`Function calling 'new_story_page', params is:`, page, widgets)
          storyService.newStoryPage({...page, widgets})
          return `✅ ${storyService.translate('Story.Copilot.InstructionExecutionComplete', {
            Default: 'Instruction Execution Complete'
          })}`
        }
      })
    ]
  })
}
