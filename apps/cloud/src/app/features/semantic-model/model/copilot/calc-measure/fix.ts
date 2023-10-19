import { uuid } from '@metad/components/core'
import { CopilotChatConversation, CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt } from '@metad/core'
import { C_MEASURES, CalculatedMember, omitBlank } from '@metad/ocap-core'
import { of, throwError } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelCopilotChatConversation } from '../types'
import { editModelExpression } from './schema'
import { ModelDesignerType } from '../../types'


export function chatFixCalculatedMeasure(copilot: ModelCopilotChatConversation) {
  const { logger, copilotService, prompt, entityService } = copilot
  const currentCalculatedMember = entityService.currentCalculatedMember()
  const entityType = entityService.entityType()

  const systemPrompt = `Fix MDX calculated measure for the cube based on the prompt.
Original formula is "${currentCalculatedMember?.formula || 'empty'}" and name is "${currentCalculatedMember?.name || 'empty'}" and caption is "${currentCalculatedMember?.caption || 'empty'}".
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

export function fixCalculatedMeasure(copilot: CopilotChatConversation) {
  const { entityService, response } = copilot as ModelCopilotChatConversation
  const currentCalculatedMember = entityService.currentCalculatedMember()
  const calculatedMeasure = response.arguments as CalculatedMember

  entityService.updateCubeProperty({
    type: ModelDesignerType.calculatedMember,
    id: currentCalculatedMember.__id__,
    model: {
      ...calculatedMeasure
    }
  })

  return of({
    ...copilot,
    response: calculatedMeasure
  })
}

export function checkCalculatedMemberPrerequisite(copilot: ModelCopilotChatConversation) {
  const { entityService } = copilot
  const current = entityService.currentCalculatedMember()

  if (!current) {
    return throwError(() => new Error(`请转到计算成员界面执行`))
  }

  return of(copilot)
}
