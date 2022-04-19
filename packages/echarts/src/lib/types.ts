import { ChartMeasure, Property } from "@metad/ocap-core"

export enum AxisEnum {
  x = 'xAxis',
  y = 'yAxis',
  xAxis = 'x',
  yAxis = 'y',
  radius = 'radiusAxis',
  angle = 'angleAxis',
  radiusAxis = 'radius',
  angleAxis = 'angle',
  singleAxis = 'singleAxis'
}

export interface ChartSettings {
  /**
   * 格子横向个数
   */
  trellisHorizontal: number
  /**
   * 格子纵向个数
   */
  trellisVertical: number
}

export interface ChartOptions {
  options: any
}

export interface SeriesComponentType extends Partial<ChartMeasure> {
  id?: string
  name: string // 名称
  seriesType?: string
  seriesStack?: string
  noDisplay?: boolean // 是否显示在如 tooltip 中
  property?: Property // 对应的 OData Metadata 字段
  dataMin?: number
  dataMax?: number
  dataSize?: number
  categoryAxisIndex?: number
  valueAxisIndex?: number
  // series 组件对应的 measure 字段， 默认为一个， 在 scatter 图形中可能为两个或多个
  measures?: Array<string>
  datasetIndex?: number
  seriesLayoutBy?: string
  tooltip?: string[]
}