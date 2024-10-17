import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export interface IAiModel extends IBasePerTenantAndOrganizationEntityModel {
  /**
   * 模型名称
   */
  name: string

  /**
   * 模型展示名称
   */
  label: string

  /**
   * 模型类型
   */
  modelType: string

  /**
   * 模型特性
   */
  features: string[]

  /**
   * 模型属性
   */
  modelProperties: Record<string, any>

  /**
   * 参数规则
   */
  parameterRules: Record<string, any>[]

  /**
   * 定价信息
   */
  pricing: {
    input: string
    output: string
    unit: string
    currency: string
  }

  /**
   * 是否已废弃
   */
  deprecated: boolean
}

export enum ModelType {
  LLM = "llm",
  TEXT_EMBEDDING = "text-embedding",
  RERANK = "rerank",
  SPEECH2TEXT = "speech2text",
  MODERATION = "moderation",
  TTS = "tts",
  TEXT2IMG = "text2img"
}

export enum ProviderType {
  CUSTOM = 'custom',
  SYSTEM = 'system'
}
