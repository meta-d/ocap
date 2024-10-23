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
  executionMetadata?: any

  // Many to one
  agentKey?: string
  xpert?: IXpert
  xpertId?: string
}

export enum XpertAgentExecutionEnum {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}
