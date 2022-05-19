import { Annotation, PropertyName } from '../types'

export enum ValueListParameterType {
  // 输入输出
  InOut = 'InOut',
  // 仅显示
  DisplayOnly = 'DisplayOnly'
}

export interface ValueListParameter {
  // 参数字段类型
  type: ValueListParameterType
  localDataProperty: PropertyName
  valueListProperty: PropertyName
}

export interface ValueListAnnotation extends Annotation {
  collectionPath: string
  searchSupported?: boolean
  parameters: Array<ValueListParameter>
}
