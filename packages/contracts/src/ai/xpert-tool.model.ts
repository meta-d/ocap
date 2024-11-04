import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { I18nObject } from './ai-model.model'
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
  // type?: 'command' | 'agent' | 'browser' | null
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

  // Temporary properties
  provider?: IBuiltinTool
}

export type TToolProviderIdentity = {
  name: string
  author: string
  label: I18nObject
  provider: string
}

export type TToolParameter = {
  name: string
  type: string
  required: boolean
  label: I18nObject
  human_description: I18nObject
  llm_description: string
  form: string

  options: {
    value: string
    label: I18nObject
  }

  default: string
}

export interface IBuiltinTool {
  identity: TToolProviderIdentity
  description: {
    human: I18nObject
    llm: string
  }
  parameters: TToolParameter[]
}