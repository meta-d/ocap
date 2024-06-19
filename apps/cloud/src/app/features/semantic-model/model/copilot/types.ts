import { CopilotChatConversation, CopilotService } from '@metad/copilot'
import { EntityType } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { inject } from '@angular/core'
import { NgmCopilotService } from '@metad/copilot-angular'


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

export const ModelCopilotCommandArea = 'Model'

export function injectCopilotRoleContext() {
  const copilotService = inject(NgmCopilotService)

  return () => {
    return copilotService.rolePrompt()
  }
}