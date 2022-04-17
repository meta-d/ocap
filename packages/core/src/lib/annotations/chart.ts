import { Annotation, Dimension, Measure } from "../types"

// for ChartAnnotation
export enum ChartDimensionRoleType {
  Time = 'Time',
  Category = 'Category',
  Category2 = 'Category2',
  
  // dimension 作为颜色角色，图形可以根据此维度分配不同颜色
  Color = 'Color',
  /**
   */
  Group = 'Group',
  /**
   * 此 Dimension 作为 Small Multiples 图形中的 Group 维度
   */
  Trellis = 'Trellis',

  // Stacked bar 维度
  Stacked = 'Stacked'
}

export enum ChartMeasureRoleType {
  Axis1 = 'Axis1',
  Axis2 = 'Axis2',
  Axis3 = 'Axis3',
  Size = 'Size',
  Lightness = 'Lightness',
  Tooltip = 'Tooltip'
}

export interface ChartDimension extends Dimension {
  role?: ChartDimensionRoleType
}

export enum ReferenceLineType {
  markPoint = 'markPoint',
  markLine = 'markLine'
}

export enum ReferenceLineValueType {
  fixed = 'fixed',
  dynamic = 'dynamic'
}

export enum ReferenceLineAggregation {
  min = 'min',
  max = 'max',
  average = 'average',
  median = 'median'
}

export interface ReferenceLine {
  label: string
  type: ReferenceLineType
  valueType: ReferenceLineValueType
  value?: number
  measure?: string
  aggregation?: ReferenceLineAggregation
  above?: string
  below?: string
}

export enum ChartPattern {
  a,
  b,
  c,
  d,
  e,
  f,
  g,
  h
}

export interface ChartMeasure extends Measure {
  role?: ChartMeasureRoleType
  palette?: {
    name: string,
    reverse: boolean
    pattern: ChartPattern
  }
  domain?: [number, number?]
  /**
   * 对应 ECharts 中的 series type
   */
  shapeType?: string

  referenceLines?: ReferenceLine[]
}
export enum ChartOrient {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export interface ChartType {
  type: string
  orient?: ChartOrient
  variant?: string
}

export interface ChartAnnotation extends Annotation {
  qualifier?: string
  chartType: ChartType // Chart type
  dimensions: Array<ChartDimension>
  measures: Array<ChartMeasure>
  // 图形库详细的配置项
  options?: any
}
