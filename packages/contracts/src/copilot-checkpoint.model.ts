import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'

/**
 * Checkpoints for copilot, for langgraph framework
 */
export interface ICopilotCheckpoint extends IBasePerTenantAndOrganizationEntityModel {
  thread_id: string
  checkpoint_id: string
  parent_id?: string
  checkpoint: string
  metadata: string
}
