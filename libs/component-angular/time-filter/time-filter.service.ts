import { Injectable } from '@angular/core'
import { NxCoreService } from '@metad/core'
import {
  addDays,
  addMonths,
  addQuarters,
  addYears,
  format,
  subDays,
  subMonths,
  subQuarters,
  subYears,
} from 'date-fns'

/**
 * @deprecated 还在用吗?
 */
@Injectable()
export class NxTimeFilterService {
  constructor(private coreService: NxCoreService) {}

  // calcRanges({ ranges, currentDate }) {
  //   return ranges?.map((range) => {
  //     const current = this.currentPeriod(currentDate, range)
  //     return {
  //       ...range,
  //       currentPeriod: this.formatCurrentPeriod(
  //         range.granularity,
  //         current
  //       ),
  //       result: this.calcRange(currentDate, range),
  //     }
  //   })
  // }

  // calcRange(currentDate, range: TimeRange) {
  //   const current = this.currentPeriod(currentDate, range)
  //   return [
  //     this.formatCurrentPeriod(
  //       range.granularity,
  //       this.calcOffset(current, {
  //         direction: OffSetDirection.LookBack,
  //         granularity: range.granularity,
  //         amount: range.lookBack || 0,
  //       })
  //     ),

  //     this.formatCurrentPeriod(
  //       range.granularity,
  //       this.calcOffset(current, {
  //         direction: OffSetDirection.LookAhead,
  //         granularity: range.granularity,
  //         amount: range.lookAhead || 0,
  //       })
  //     ),
  //   ]
  // }

  // formatCurrentPeriod(granularity, current) {
  //   console.warn(granularity, current)
  //   if (granularity === null || current === null) {
  //     return null
  //   }
  //   let _format = 'yyyMMdd'
  //   switch (granularity) {
  //     case TimeGranularity.Year:
  //       _format = 'yyyy'
  //       break
  //     case TimeGranularity.Quarter:
  //       _format = `yyyy'Q'Q`
  //       break
  //     case TimeGranularity.Month:
  //       _format = 'yyyyMM'
  //       break
  //     case TimeGranularity.Day:
  //       _format = 'yyyyMMdd'
  //       break
  //   }

  //   return format(current, _format)
  // }

  // currentPeriod(currentDate, { type, granularity, current }: TimeRange) {
  //   console.warn(granularity, current)
  //   if (type === TimeRangeType.Offset && current?.direction && current?.granularity) {
  //     return this.calcOffset(this.coreService.executeDateFunction(currentDate), current)
  //   }
  //   return this.coreService.executeDateFunction(currentDate)
  // }

  // calcOffset(currentDate, { direction, granularity, amount }: Partial<TimeOffSet>) {
  //   amount = amount || 0
  //   switch (granularity) {
  //     case TimeGranularity.Year:
  //       if (direction === OffSetDirection.LookBack) {
  //         return subYears(currentDate, amount)
  //       } else {
  //         return addYears(currentDate, amount)
  //       }
  //     case TimeGranularity.Quarter:
  //       if (direction === OffSetDirection.LookBack) {
  //         return subQuarters(currentDate, amount)
  //       } else {
  //         return addQuarters(currentDate, amount)
  //       }
  //     case TimeGranularity.Month:
  //       if (direction === OffSetDirection.LookBack) {
  //         return subMonths(currentDate, amount)
  //       } else {
  //         return addMonths(currentDate, amount)
  //       }
  //     case TimeGranularity.Day:
  //       if (direction === OffSetDirection.LookBack) {
  //         return subDays(currentDate, amount)
  //       } else {
  //         return addDays(currentDate, amount)
  //       }
  //   }
  // }
}
