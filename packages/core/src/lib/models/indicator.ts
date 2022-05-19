import { ISlicer } from '../types'

export interface Indicator {
  /**
   * 系统 ID
   */
  id: string
  /**
   * 业务编码
   */
  code: string
  /**
   * 名称
   */
  name: string
  /**
   * 语义模型 ID
   */
  modelId: string
  /**
   * 模型实体
   */
  entity?: string
  /**
   * 自由维度
   */
  dimensions?: string[]
  /**
   * 过滤器
   */
  filters: Array<ISlicer>
  /**
   * 度量
   */
  measure: string
  /**
   * 计算公式
   */
  formula: string
  /**
   * 单位
   */
  unit: string
}

export function getIndicatorMeasureName(indicator: Indicator) {
  const name = indicator.code || indicator.name
  return indicator.formula ? (name + '_formula') : indicator.measure
}