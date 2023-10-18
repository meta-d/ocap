import { uuid } from '@metad/components/core'
import { CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { omitBlank } from '@metad/ocap-core'
import { map } from 'rxjs/operators'
import { SemanticModelEntityType } from '../../types'
import { ModelCopilotChatConversation } from '../types'
import { editModelCube } from './schema'
import { of } from 'rxjs'

export function chatCube(copilot: ModelCopilotChatConversation) {
  const { logger, copilotService, prompt, sharedDimensionsPrompt } = copilot

  const systemPrompt = `Generate cube metadata for MDX. The cube name can't be the same as the table name. Partition the table fields that may belong to the same dimension into the levels of hierarchy of the same dimension.
    There is no need to create as dimension with those table fields that are already used in dimensionUsages.
    The cube can fill the source field in dimensionUsages only within the name of shared dimensions: ${sharedDimensionsPrompt}.
    `
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
        ...editModelCube,
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

export function createCube(copilot: ModelCopilotChatConversation) {
  const { modelService, response } = copilot
  const cube = response.arguments

  const key = uuid()
  const cubeState = {
    type: SemanticModelEntityType.CUBE,
    id: key,
    name: cube.name,
    caption: cube.caption,
    cube: {
      ...cube,
      __id__: key,
      measures: cube.measures?.map((measure) => ({ ...measure, __id__: uuid(), visible: true })),
      dimensions: cube.dimensions?.map((dimension) => ({
        ...dimension,
        __id__: uuid(),
        hierarchies: dimension.hierarchies?.map((hierarchy) => ({
          ...hierarchy,
          __id__: uuid(),
          levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
        }))
      })),
      dimensionUsages: cube.dimensionUsages?.map((dimensionUsage) => ({ ...dimensionUsage, __id__: uuid() }))
    },
    sqlLab: {}
  }

  modelService.newEntity(cubeState)
  modelService.activeEntity(cubeState)

  return of({
    ...copilot,
    response: cubeState
  })
}
