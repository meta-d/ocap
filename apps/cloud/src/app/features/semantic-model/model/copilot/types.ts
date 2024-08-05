import { CopilotChatConversation, CopilotService } from '@metad/copilot'
import { EntityType, PropertyDimension } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { flatten } from 'lodash-es'

export const ModelCopilotCommandArea = 'Model'

export interface ModelCopilotChatConversation extends CopilotChatConversation {
  dataSource: string
  modelService: SemanticModelService
  entityService: ModelEntityService
  copilotService: CopilotService
  entityType: EntityType
  logger?: NGXLogger

  //
  sharedDimensionsPrompt: string
}

export function getTablesFromDimension(dimension: PropertyDimension) {
  return flatten(dimension.hierarchies.map((hierarchy) => hierarchy.tables.map((table) => table.name)))
}