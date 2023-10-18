import { uuid } from '@metad/components/core'
import { CopilotChatConversation, CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { omitBlank } from '@metad/ocap-core'
import { map } from 'rxjs/operators'
import { SemanticModelEntityType } from '../../types'
import { ModelCopilotChatConversation } from '../types'
import { editModelExpression } from './schema'
import { of } from 'rxjs'
import { calcEntityTypePrompt } from '@metad/core'

export function chatCalculatedMeasure(copilot: ModelCopilotChatConversation) {
  const { logger, copilotService, prompt, entityService } = copilot

  const entityType = entityService.entityType()

  const systemPrompt = `根据提示创建 MDX calculated member measure for the cube.
The cube is: ${calcEntityTypePrompt(entityType)}.`
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
        ...editModelExpression,
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

export function createCalculatedMeasure(copilot: CopilotChatConversation) {
  const { modelService, response } = copilot as ModelCopilotChatConversation
  const cube = response.arguments

  const key = uuid()
  const cubeState = {
    
  }
  return of({
    ...copilot,
    response: cubeState
  })
}
