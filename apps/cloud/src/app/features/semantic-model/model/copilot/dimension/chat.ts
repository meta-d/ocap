import { uuid } from '@metad/components/core'
import { PropertyDimension } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { ModelDimensionState, SemanticModelEntityType } from '../../types'

// export function chatDimension(copilot: ModelCopilotChatConversation) {
//   const { logger, copilotService, prompt, sharedDimensionsPrompt } = copilot

//   const systemPrompt = `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`
//   return copilotService
//     .chatCompletions(
//       [
//         {
//           role: CopilotChatMessageRoleEnum.System,
//           content: systemPrompt
//         },
//         {
//           role: CopilotChatMessageRoleEnum.User,
//           content: prompt
//         }
//       ],
//       {
//         ...editModelDimension,
//         ...omitBlank(copilot.options)
//       }
//     )
//     .pipe(
//       map(({ choices }) => {
//         try {
//           copilot.response = getFunctionCall(choices[0].message)
//         } catch (err) {
//           copilot.error = err as Error
//         }
//         return copilot
//       })
//     )
// }

export function createDimension(modelService: SemanticModelService, dimension: PropertyDimension) {
  const key = uuid()
  const dimensionState: ModelDimensionState = {
    type: SemanticModelEntityType.DIMENSION,
    id: key,
    name: dimension.name,
    caption: dimension.caption,
    dimension: {
      ...dimension,
      __id__: key,
      hierarchies: dimension.hierarchies?.map((hierarchy) => ({
        ...hierarchy,
        __id__: uuid(),
        levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
      }))
    }
  }

  modelService.newDimension(dimensionState)
  modelService.activeEntity(dimensionState)
}
