// import { Semantics } from "@metad/ocap-core"

import { TimeGranularity } from "@metad/ocap-core";

// export enum TimeGranularity {
//   Year = 'Year',
//   Quarter = 'Quarter',
//   Month = 'Month',
//   Week = 'Week',
//   Day = 'Day',
//   // @todo more
// }

// export enum TimeRangeType {
//   Standard = 'Standard',
//   Offset = 'Offset',
// }

// export enum OffSetDirection {
//   LookBack = 'LookBack',
//   LookAhead = 'LookAhead',
// }

// export interface TimeOffSet {
//   current?: Date
//   direction: OffSetDirection
//   granularity: TimeGranularity
//   amount: number
// }

// export interface TimeRange {
//   type: TimeRangeType
//   granularity: TimeGranularity
//   current?: Exclude<TimeOffSet, 'granularity'>
//   lookBack?: number
//   lookAhead?: number
//   selected?: boolean
//   /**
//    * 时间值的格式化字符串
//    */
//   formatter?: string
// }

// export function mapTimeGranularitySemantic(granularity: TimeGranularity): Semantics {
//   switch(granularity) {
//     case TimeGranularity.Year:
//       return Semantics["Calendar.Year"]
//     case TimeGranularity.Quarter:
//       return Semantics["Calendar.Quarter"]
//     case TimeGranularity.Month:
//       return Semantics["Calendar.Month"]
//     case TimeGranularity.Day:
//       return Semantics["Calendar.Day"]
//     default:
//       throw new Error(`Can't found semantics for granularity ${granularity}`)
//   }
// }

export const TIME_GRANULARITY_SEQUENCES = {
  0: [TimeGranularity.Year, TimeGranularity.Month],
  1: [TimeGranularity.Year, TimeGranularity.Quarter, TimeGranularity.Month],
  2: [TimeGranularity.Year, TimeGranularity.Month, TimeGranularity.Day],
  3: [TimeGranularity.Year, TimeGranularity.Quarter, TimeGranularity.Month, TimeGranularity.Day],
}
