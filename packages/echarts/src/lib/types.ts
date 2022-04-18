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
