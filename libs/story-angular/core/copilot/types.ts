import { NgmCopilotService } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { NxStoryService } from '../story.service'

export interface CopilotChartConversation {
  dataSource: string
  storyService: NxStoryService
  copilotService: NgmCopilotService
  command: string
  prompt: string
  options: any
  entityType: EntityType
  response?: { arguments: any } | any
  error?: string | Error
  logger?: NGXLogger
}

export const CopilotDefaultOptions = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2
}