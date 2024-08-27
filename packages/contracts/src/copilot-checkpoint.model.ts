import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'

/**
 * Checkpoints for copilot, for langgraph framework
 */
export interface ICopilotCheckpoint extends IBasePerTenantAndOrganizationEntityModel {
  thread_id: string
  checkpoint_ns: string
  checkpoint_id: string
  parent_id?: string
  type?: string
  checkpoint: Uint8Array
  metadata: Uint8Array
}

export interface ICopilotCheckpointWrites extends IBasePerTenantAndOrganizationEntityModel {
  thread_id: string
  checkpoint_ns: string
  checkpoint_id: string
  task_id?: string
  idx?: number
  channel?: string
  type?: string
  value: Uint8Array
}
