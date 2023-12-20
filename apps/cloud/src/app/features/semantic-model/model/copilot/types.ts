import { CopilotChatConversation } from '@metad/copilot'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { EntityType } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'

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
