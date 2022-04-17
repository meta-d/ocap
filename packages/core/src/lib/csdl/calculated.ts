import { isNil } from 'lodash'
import { Dimension, IMember, ISlicer, Measure, PrimitiveType, PropertyName } from '../types'
import { Property, PropertyMeasure } from './entity'

/**
 * 计算字段类型
 */
export enum CalculationType {
  Restricted = 'Restricted',
  Calculated = 'Calculated',
  Aggregation = 'Aggregation',
  Variance = 'Variance',
  D2Measure = 'D2Measure',
  MeasureControl = 'MeasureControl',
  Parameter = 'Parameter',
  Indicator = 'Indicator'
}

export enum AggregationOperation {
  SUM = 'SUM',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  AVERAGE = 'AVERAGE',
  STDEV = 'STDEV',
  STDEVP = 'STDEVP',
  MEDIAN = 'MEDIAN',
  TOP_PERCENT = 'TOP_PERCENT',
  TOP_COUNT = 'TOP_COUNT'
}

export interface CalculatedMember {
  name: string
  formula: string
}

/**
 * 计算字段
 */
export interface CalculationProperty extends Property {
  calculationType: CalculationType
}

export interface CalculatedProperty extends CalculationProperty, CalculatedMember {

}

export interface RestrictedMeasureProperty extends CalculationProperty {
  measure: PropertyName
  dimensions: Array<Dimension>
  /**
   * Enable Constant Selection
   */
  enableConstantSelection?: boolean
  /**
   * All Selection Context Dimensions
   */
  allSelectionContext?: boolean
  /**
   * Constant Dimensions
   */
  constantDimensions?: Array<Dimension>
}

export interface AggregationProperty extends CalculationProperty {
  operation: AggregationOperation
  measure?: PropertyName
  value?: number // for TopPercent TopCount
  aggregationDimensions: Array<Dimension>
  useConditionalAggregation?: boolean
  conditionalDimensions?: Array<Dimension>
  excludeConditions?: boolean
}

export enum CompareToEnum {
  CurrentMember = 'CurrentMember',
  CurrentDate = 'CurrentDate',
  SelectedMember = 'SelectedMember',
  Lag = 'Lag',
  Lead = 'Lead',
  Parallel = 'Parallel'
}

export interface CompareToType {
  type: CompareToEnum
  value?: number
  slicer?: ISlicer
}

/**
 * 计算成员与另外一个指定成员之间的度量差异
 */
export interface VarianceMeasureProperty extends CalculationProperty {
  /**
   * 要比较的度量
   */
  measure: Measure
  baseDimension: Dimension
  compareA: CompareToType
  toB: CompareToType

  /**
   * Set No data as Zero
   */
  asZero?: boolean
  /**
   * 是否为比率
   */
  asPercentage?: boolean
  /**
   * 对分母取绝对值
   */
  absBaseValue?: boolean

  divideBy?: 'A' | 'B'
}

export enum ParameterControlEnum {
  Input,
  Select,
  Dimensions
}

// export interface ParameterControlProperty extends CalculationProperty {
//   paramType: ParameterControlEnum
//   value: PrimitiveType

//   // 候选成员
//   availableMembers: Array<IMember>
// }

export interface MeasureControlProperty extends CalculationProperty {
  value: PrimitiveType

  allMeasures: boolean

  // 候选成员
  availableMembers: Array<IMember>
}

export const isCalculationProperty = (toBe): toBe is CalculationProperty =>
  !isNil((toBe as CalculationProperty)?.calculationType)

export const isCalculatedProperty = (toBe): toBe is CalculatedProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.Calculated

export const isAggregationProperty = (toBe): toBe is AggregationProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.Aggregation

export const isRestrictedMeasureProperty = (toBe): toBe is RestrictedMeasureProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.Restricted

export const isVarianceMeasureProperty = (toBe): toBe is VarianceMeasureProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.Variance

export const isMeasureControlProperty = (toBe): toBe is MeasureControlProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.MeasureControl

export const isIndicatorMeasureProperty = (toBe): toBe is RestrictedMeasureProperty =>
  isCalculationProperty(toBe) && toBe.calculationType === CalculationType.Indicator

export function getMeasurePropertyUnit(property: Property) {
  if (isVarianceMeasureProperty(property)) {
    if (property.asPercentage) {
      return '%'
    }
  }

  return (property as PropertyMeasure)?.formatting?.unit
}

export function parameterFormatter(name: string) {
  return `[@${name}]`
}
