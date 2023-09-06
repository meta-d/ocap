import { Observable } from 'rxjs'

export type Canvas = {
  width: number
  height: number
}

export interface NxChartSettings {
  canvas: Canvas
}

export enum ChartDataZoomType {
  inside = 'inside',
  slider = 'slider',
  inside_slider = 'inside&slider'
}

export interface NxChartOptions {
  // Data Zoom
  dataZoom?: {
    type: ChartDataZoomType
  }
}

export interface NxChartComplexityOptions {
  baseOption?: any
  // 极简
  minimalist: any
  // 简约
  concise?: any
  // 正常
  normal: any
  // 全面
  comprehensive: any
  // 极其全面
  extremely?: any
}

export interface NxChartEngine {
  // 图形相关设置
  // settings: NxChartSettings
  // // ECharts 图形设置
  // chartOptions: NxChartOptions
  // // 图形复杂度配置
  // complexityOptions: NxChartComplexityOptions
  // // 系统内部错误
  // internalError: Observable<string>
  selectChartOptions(items: any[]): Observable<any>
  changeData(data: any): void
  processData(data: any): any
  onChartOptions(): Observable<any>
  onDestroy(): void
}

// /**
//  * merge 界面复杂度默认配置与 ChartSettings
//  */
// export function mergeComplexity<T>(settings: Partial<NxChartOptions>, options?: NxChartComplexityOptions): T {
//   settings = omitBy<NxChartOptions>(settings, isNil)

//   switch (settings?.complexity) {
//     case ChartComplexity.Minimalist:
//       return merge(merge(options?.baseOption, options?.minimalist), settings)
//     case ChartComplexity.Concise:
//       return merge(merge(options?.baseOption, options?.concise), settings)
//     case ChartComplexity.Normal:
//       return merge(merge(options?.baseOption, options?.normal), settings)
//     case ChartComplexity.Comprehensive:
//       return merge(merge(options?.baseOption, options?.comprehensive), settings)
//     case ChartComplexity.Extremely:
//       return merge(merge(options?.baseOption, options?.extremely), settings)
//     default:
//       return settings as unknown as T
//   }
// }
