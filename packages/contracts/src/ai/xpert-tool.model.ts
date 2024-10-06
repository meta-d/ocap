import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { AiProviderRole } from './copilot.model'
import { IXpertToolset } from './xpert-toolset.model'

/**
 * Tools for Xpert
 */
export interface IXpertTool extends IBasePerTenantAndOrganizationEntityModel, XpertToolType {}

export type XpertToolType = {
  name: string
  description?: string
  /**
   * Is enabled in toolset
   */
  enabled?: boolean
  options?: Record<string, any>
  type?: 'command' | 'agent' | 'browser' | null
  schema?: Record<string, any>

  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  aiProviderRole?: AiProviderRole

  toolset?: IXpertToolset
}
