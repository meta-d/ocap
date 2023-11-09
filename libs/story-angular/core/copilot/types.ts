import { NgmCopilotService } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { CopilotChatConversation } from '@metad/copilot'
import { NGXLogger } from 'ngx-logger'
import { NxStoryService } from '../story.service'

export interface StoryCopilotChatConversation extends CopilotChatConversation {
  dataSource: string
  storyService: NxStoryService
  copilotService: NgmCopilotService
  entityType: EntityType
  logger?: NGXLogger
}

export const StoryCopilotCommandArea = 'Story'