import { StoredMessage } from '@langchain/core/messages'
import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpert } from './xpert.model'

/**
 * Execute xpert agent
 */
export interface IXpertAgentExecution extends IBasePerTenantAndOrganizationEntityModel {
  title?: string
  processData?: any
  inputs?: any
  outputs?: any
  status?: XpertAgentExecutionEnum
  error?: string
  elapsedTime?: number
  tokens?: number
  executionMetadata?: any

  thread_id?: string
  parent_thread_id?: string

  // Many to one
  agentKey?: string
  xpert?: IXpert
  xpertId?: string
  // Parent AgentExecution
  parentId?: string

  subExecutions?: IXpertAgentExecution[]

  // Temporary properties
  // From CopilotCheckpoint
  messages?: StoredMessage[]
}

export enum XpertAgentExecutionEnum {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}
