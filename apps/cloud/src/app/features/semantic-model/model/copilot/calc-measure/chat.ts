import { uuid } from '@metad/components/core'
import { CopilotChatConversation, CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt } from '@metad/core'
import { C_MEASURES, CalculatedMember, omitBlank } from '@metad/ocap-core'
import { of, throwError } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelCopilotChatConversation } from '../types'
import { editModelExpression } from './schema'


export function chatCalculatedMeasure(copilot: ModelCopilotChatConversation) {
  const { logger, copilotService, prompt, entityService } = copilot

  const entityType = entityService.entityType()

  const systemPrompt = `Create MDX calculated measure for the cube based on the prompt.
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
  const { entityService, response } = copilot as ModelCopilotChatConversation
  const calculatedMeasure = response.arguments as CalculatedMember

  const key = uuid()
  calculatedMeasure.__id__ = key
  calculatedMeasure.dimension = C_MEASURES
  calculatedMeasure.visible = true

  entityService.addCalculatedMeasure(calculatedMeasure)
  entityService.navigateCalculation(key)

  return of({
    ...copilot,
    response: calculatedMeasure
  })
}

export function checkPrerequisite(copilot: ModelCopilotChatConversation) {
  if (!copilot.entityService) {
    return throwError(() => new Error(`请转到多维数据集界面执行`))
  }

  return of(copilot)
}
