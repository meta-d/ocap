import { InjectionToken, Type } from '@angular/core'
import { isNil, merge, omitBy } from 'lodash-es'
import { Observable } from 'rxjs'
import { ChartComplexity, NxChartLibrary, NxChartType, NxChromatic, NxChromatics } from './types'

export interface SmartChartTypeProvider {
  chartLib: NxChartLibrary
  chartType: NxChartType
  // smartChartType: Type<NxChartEngine>
}
export const NX_SMART_CHART_TYPE = new InjectionToken<Array<SmartChartTypeProvider>>('Nx Smart Chart Type')

export type Canvas = {
  width: number
  height: number
}

export interface NxChartSettings {
  canvas: Canvas
}

// export enum ChartDataZoomType {
//   INSIDE = 'inside',
//   SLIDER = 'slider',
//   INSIDE_SLIDER = 'inside&slider'
// }

// export interface NxChartOptions {
//   // 图形的界面复杂度配置, 要支持动态变动
//   complexity?: ChartComplexity
//   // 图形色彩配置
//   chromatics?: NxChromatics
//   // Data Zoom
//   dataZoom?: {
//     type: ChartDataZoomType
//   }
// }

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

// export interface NxChartEngine {
//   __chartOptionsOrigin
//   // 图形相关设置
//   settings: NxChartSettings
//   // ECharts 图形设置
//   chartOptions: NxChartOptions
//   // 图形复杂度配置
//   complexityOptions: NxChartComplexityOptions
//   // 系统内部错误
//   internalError: Observable<string>
//   selectChartOptions(items): Observable<any>
//   changeData(data: any): void
//   processData(data): any
//   onChartOptions(): Observable<any>
//   onDestroy()
// }

export interface NxIScaleChromatic {
  convertToScale(chromatic: NxChromatic)
  setChromatics(chromatics: NxChromatics)
  setUserChromatics(chromatics: NxChromatics)
  onChange(): Observable<NxChromatics>
}

export const NX_SCALE_CHROMATIC = new InjectionToken<NxIScaleChromatic>('Nx Scale Chromatic Service')

/**
 * merge 界面复杂度默认配置与 ChartSettings
 */
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

// export function Complexity() {
//   return (target: NxChartEngine, propertyKey: string) => {

//     const original = Object.getOwnPropertyDescriptor(target, propertyKey)

//     const setter = function (newVal: NxChartOptions) {
//       // merge 而不是直接覆盖, 因为会有默认值存在
//       target.__chartOptionsOrigin = merge(target.__chartOptionsOrigin, newVal)
//       original?.set?.apply(target, mergeComplexity(target.__chartOptionsOrigin, target.complexityOptions))
//     }
//     Object.defineProperty(target, propertyKey, {
//       // get: getter,
//       set: setter,
//     })
//   }
// }
