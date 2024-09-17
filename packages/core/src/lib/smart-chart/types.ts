import { ChartType } from '../annotations'
import { ISlicer } from '../types'

export interface ChartSettings {
  /**
   * 图形主题
   */
  theme?: string
  /**
   * Locale / Language
   */
  locale?: string

  /**
   * digitsInfo for number formater 
   */
  digitsInfo?: string
  /**
   * 格子横向个数
   */
  trellisHorizontal?: number
  /**
   * 格子纵向个数
   */
  trellisVertical?: number

  /**
   * 对应 ECharts 的 Universal Transition
   */
  universalTransition?: boolean

  /**
   * The maximum limit of data that show in chart
   */
  maximumLimit?: number

  /**
   * standby chart types for chart annotation
   */
  chartTypes?: ChartType[]
}

export interface ChartOptions {
  options?: any
  tooltip?: any
  axis?: any
  visualMap?: any
  dataZoom?: any
  [key: string]: any
}

export interface IChartClickEvent {
  filter?: ISlicer
  item?: any
  data: any
  event: MouseEvent
}

export interface IChartSelectedEvent {
  slicers: ISlicer[]
  event: MouseEvent
}

export enum ChartTypeEnum {
  Column = 'Column',
  ColumnStacked = 'ColumnStacked',
  ColumnDual = 'ColumnDual',
  ColumnStackedDual = 'ColumnStackedDual',
  ColumnStacked100 = 'ColumnStacked100',
  ColumnStackedDual100 = 'ColumnStackedDual100',
  ColumnGrouped = 'ColumnGrouped',
  ColumnPolar = 'ColumnPolar',
  Bar = 'Bar',
  BarStacked = 'BarStacked',
  BarDual = 'BarDual',
  BarStackedDual = 'BarStackedDual',
  BarStacked100 = 'BarStacked100',
  BarStackedDual100 = 'BarStackedDual100',
  BarGrouped = 'BarGrouped',
  BarPolar = 'BarPolar',
  Histogram = 'Histogram',
  Area = 'Area',
  AreaStacked = 'AreaStacked',
  AreaStacked100 = 'AreaStacked100',
  HorizontalArea = 'HorizontalArea',
  HorizontalAreaStacked = 'HorizontalAreaStacked',
  HorizontalAreaStacked100 = 'HorizontalAreaStacked100',
  Line = 'Line',
  Lines = 'Lines',
  StepLine = 'StepLine',
  LineDual = 'LineDual',
  Combination = 'Combination',
  CombinationStacked = 'CombinationStacked',
  CombinationDual = 'CombinationDual',
  CombinationStackedDual = 'CombinationStackedDual',
  HorizontalCombinationStacked = 'HorizontalCombinationStacked',
  Pie = 'Pie',
  Doughnut = 'Doughnut',
  Nightingale = 'Nightingale',
  Scatter = 'Scatter',
  Bubble = 'Bubble',
  Radar = 'Radar',
  Boxplot = 'Boxplot',
  Heatmap = 'Heatmap',
  Treemap = 'Treemap',
  Waterfall = 'Waterfall',
  Bullet = 'Bullet',
  VerticalBullet = 'VerticalBullet',
  HorizontalWaterfall = 'HorizontalWaterfall',
  HorizontalCombinationDual = 'HorizontalCombinationDual',
  HorizontalCombinationStackedDual = 'HorizontalCombinationStackedDual',
  // 3D
  Bar3D = 'Bar3D',
  Line3D = 'Line3D',
  Scatter3D = 'Scatter3D',

  // Custom types
  Custom = 'Custom',
  GeoMap = 'GeoMap',
  Timeline = 'Timeline',
  Sankey = 'Sankey',
  Sunburst = 'Sunburst',
  RadialBar = 'RadialBar',
  RadialBarStacked = 'RadialBarStacked',
  RadialPie = 'RadialPie',
  RadialPieStacked = 'RadialPieStacked',
  RadialScatter = 'RadialScatter',
  Funnel = 'Funnel',
  PolarLine = 'PolarLine',
  Rose = 'Rose',
  Tree = 'Tree',
  ThemeRiver = 'ThemeRiver'
}
