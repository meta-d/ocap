import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateStoryGraph } from './graph'

export function injectStoryCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const storyService = inject(NxStoryService)

  const createGraph = injectCreateStoryGraph()

  const commandName = 'story'
  return injectCopilotCommand(commandName, {
    alias: 's',
    description: translate.instant('PAC.Story.CommandStoryDesc', {
      Default: 'Describe the story you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [
        'tools'
      ]
    },
    createGraph
  })
}
