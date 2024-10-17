import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export interface IAiProvider extends IBasePerTenantAndOrganizationEntityModel {
  /**
   * 供应商标识,如 'openai'
   */
  name: string

  /**
   * 供应商展示名称
   */
  label: string

  /**
   * 供应商描述
   */
  description: string

  /**
   * 供应商小图标
   */
  iconSmall: string

  /**
   * 供应商大图标
   */
  iconLarge: string

  /**
   * 背景颜色
   */
  background: string

  /**
   * 帮助信息标题
   */
  helpTitle: string

  /**
   * 帮助信息URL
   */
  helpUrl: string

  /**
   * 支持的模型类型
   */
  supportedModelTypes: string[]

  /**
   * 配置方式
   */
  configurateMethods: string[]
}
