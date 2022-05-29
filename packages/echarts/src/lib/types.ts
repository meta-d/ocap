import { ChartDimension, ChartMeasure, ChartOptions, Property } from "@metad/ocap-core"

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



export interface SeriesComponentType extends Partial<ChartMeasure> {
  id?: string
  name: string // 名称
  caption?: string // 文本描述
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
  sizeMeasure?: ChartMeasure
  lightnessMeasure?: ChartMeasure
}

export interface EChartsOptions extends ChartOptions {
  /**
   * https://echarts.apache.org/en/option.html#grid
   */
  grid?: any
  /**
   * https://echarts.apache.org/en/option.html#legend
   */
  legend?: any
  /**
   * https://echarts.apache.org/en/option.html#dataZoom
   */
  dataZoom?: any
  /**
   * https://echarts.apache.org/en/option.html#yAxis
   */
  valueAxis?: any
  /**
   * https://echarts.apache.org/en/option.html#series
   */
  seriesStyle?: any
  colors?: {
    /**
     * https://echarts.apache.org/en/option.html#color
     */
    color: string[]
  }
  /**
   * https://echarts.apache.org/en/option.html#aria
   */
  aria?: any
}

export const FORMAT_LOCALE_DATA = {
  'en': {
    lang: 'en-US',
    shortNumberFactor: 3,
    shortNumberUnits: 'K,M,B,T,Q'
  },
  'zh-Hans': {
    lang: 'zh-Hans',
    shortNumberFactor: 4,
    shortNumberUnits: '万,亿,万亿',
  }
}