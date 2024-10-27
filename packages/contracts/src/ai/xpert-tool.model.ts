import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { AiProviderRole } from './copilot.model'
import { TAvatar } from './types'
import { IXpertToolset } from './xpert-toolset.model'

/**
 * Tools for Xpert
 */
export interface IXpertTool extends IBasePerTenantAndOrganizationEntityModel, XpertToolType {}

export type XpertToolType = {
  name: string
  description?: string
  avatar?: TAvatar
  /**
   * Is enabled in toolset
   */
  enabled?: boolean
  options?: Record<string, any>
  type?: 'command' | 'agent' | 'browser' | null
  schema?: Record<string, any>
  /**
   * Default input parameters of tool
   */
  parameters?: Record<string, any>

  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  aiProviderRole?: AiProviderRole

  toolset?: IXpertToolset
}
