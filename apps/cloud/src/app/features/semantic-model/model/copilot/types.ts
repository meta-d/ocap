import { CopilotChatConversation } from '@metad/copilot'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { EntityType } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { ZodType, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

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

export function zodToAnnotations(obj: ZodType<any, ZodTypeDef, any>,) {
  return (<{ properties: any }>zodToJsonSchema(obj)).properties
}