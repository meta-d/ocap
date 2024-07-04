import { inject } from '@angular/core'
import { zodToProperties } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { StoryStyleSchema } from './schema/story.schema'

export function injectStoryStyleCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  return injectCopilotCommand({
    name: 'style',
    description: storyService.translate('Story.Copilot.StoryStyleCommandDesc', {
      Default: 'Describe the style of story you want'
    }),
    systemPrompt: async () => {
      const preferences = storyService.preferences()
      return `You are a BI analysis expert, please modify the theme and style of the story according to the prompts. Original story preferences is ${JSON.stringify(
        preferences
      )}`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'modify_story_style',
        description: '',
        argumentAnnotations: [
          {
            name: 'style',
            type: 'object',
            description: 'Story styles',
            properties: zodToProperties(StoryStyleSchema),
            required: true
          }
        ],
        implementation: async (style) => {
          logger.debug(`Function calling 'modify_story_style', params is:`, style)
          storyService.mergeStoryPreferences({
            ...style
          })
          return `✅ ${storyService.translate('Story.Copilot.InstructionExecutionComplete', {
            Default: 'Instruction Execution Complete'
          })}`
        }
      })
    ]
  })
}
