import { isNil } from "lodash"
import { Annotation, Dimension, Measure } from "../types"

// for ChartAnnotation
export enum ChartDimensionRoleType {
  Time = 'Time',
  Category = 'Category',
  /**
   * Category2
   * 其它: Color Group Stacked 都是 Category2 大类下的子类型
   */
  Category2 = 'Category2',

  // dimension 作为颜色角色，图形可以根据此维度分配不同颜色
  Color = 'Color',
  /**
   * 默认
   */
  Group = 'Group',
  // Stacked bar 维度
  Stacked = 'Stacked',
  /**
   * 此 Dimension 作为 Small Multiples 图形中的 Group 维度
   */
  Trellis = 'Trellis'
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
    name?: string
    reverse?: boolean
    pattern?: ChartPattern
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

export function getChartTrellis(chartAnnotation: ChartAnnotation): ChartDimension {
  return chartAnnotation.dimensions.find((item) => item.role === ChartDimensionRoleType.Trellis)
}
export function getChartCategory(chartAnnotation: ChartAnnotation): ChartDimension {
  return (
    chartAnnotation?.dimensions.find((dimension) => dimension.role === ChartDimensionRoleType.Category || dimension.role === ChartDimensionRoleType.Time) ||
    chartAnnotation?.dimensions.find((dimension) => isNil(dimension.role))
  )
}

export function getChartCategory2(chartAnnotation: ChartAnnotation): ChartDimension {
  return (
    chartAnnotation?.dimensions.find((dimension) => dimension.role === ChartDimensionRoleType.Category2)
  )
}

export function getChartSeries(chartAnnotation: ChartAnnotation): ChartDimension {
  return chartAnnotation.dimensions.find(
    (item) =>
      item.role === ChartDimensionRoleType.Color ||
      item.role === ChartDimensionRoleType.Group ||
      item.role === ChartDimensionRoleType.Stacked
  )
}
