import { NgmCopilotService } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { CopilotChatConversation } from '@metad/copilot'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../model.service'
import { ModelEntityService } from '../entity/entity.service'

export interface ModelCopilotChatConversation extends CopilotChatConversation {
  dataSource: string
  modelService: SemanticModelService
  entityService: ModelEntityService
  copilotService: NgmCopilotService
  entityType: EntityType
  logger?: NGXLogger

  //
  sharedDimensionsPrompt: string
}

export const ModelCopilotCommandArea = 'Model'