import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateWidgetGraph } from './graph'
import { WIDGET_COMMAND_NAME } from './types'

export function injectStoryWidgetCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const storyService = inject(NxStoryService)

  const createGraph = injectCreateWidgetGraph()

  return injectCopilotCommand(WIDGET_COMMAND_NAME, {
    alias: 'w',
    description: translate.instant('PAC.Story.CommandWidgetDesc', {
      Default: 'Describe the widget you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    createGraph
  })
}
