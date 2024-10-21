import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertAgent } from './xpert-agent.model'
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
  executionMetadata?: any
  executionId?: string

  // Many to one
  agent?: IXpertAgent
  agentId?: string
  xpert?: IXpert
  xpertId?: string
}

export enum XpertAgentExecutionEnum {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}
