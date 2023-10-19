import { CopilotChatConversation, CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt } from '@metad/core'
import { omitBlank } from '@metad/ocap-core'
import { of, throwError } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelCopilotChatConversation } from '../types'
import { queryCube } from './schema'


export function chatQuery(copilot: ModelCopilotChatConversation) {
  const { logger, copilotService, prompt, entityService } = copilot

  const entityType = entityService.entityType()

  let systemPrompt = `You are a BI analysis programmer using MDX language of cube. Create or edit MDX statement based on the prompt and the cube.
The cube is: ${calcEntityTypePrompt(entityType)}.`

  if (entityService._statement()) {
    systemPrompt += `\nOriginal MDX statement is "${entityService._statement()}".`
  }

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
        ...queryCube,
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

export function createQuery(copilot: CopilotChatConversation) {
  const { entityService, response } = copilot as ModelCopilotChatConversation
  const { statement } = response.arguments

  entityService.statement = statement

  return of({
    ...copilot,
    response: statement
  })
}

export function checkPrerequisite(copilot: ModelCopilotChatConversation) {
  if (!copilot.entityService) {
    return throwError(() => new Error(`请转到多维数据集界面执行`))
  }

  return of(copilot)
}
