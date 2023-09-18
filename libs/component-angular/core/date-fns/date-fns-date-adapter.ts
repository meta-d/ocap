import { Injectable } from '@angular/core'
import { DateAdapter } from '@angular/material/core'
import {
  addDays,
  addMonths,
  addYears,
  format,
  getDate,
  getDaysInMonth,
  getMonth,
  getYear,
  parse,
  setDay,
  setMonth,
  toDate,
} from 'date-fns'
// TODO CONFIG. Use environment or something for a dynamic locale and settings
import { zhCN as locale } from 'date-fns/locale'

const WEEK_STARTS_ON = 1 // 0 sunday, 1 monday...

export const MAT_DATE_FNS_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'LLL y',
    dateA11yLabel: 'MMMM d, y',
    monthYearA11yLabel: 'MMMM y',
  },
}

// in app.module.ts:
/*
{
  provide: DateAdapter,
  useClass: DateFnsDateAdapter
},
{
  provide: MAT_DATE_FORMATS,
  useValue: MAT_DATE_FNS_DATE_FORMATS
},
 */

function range(start: number, end: number): number[] {
  let arr: number[] = []
  for (let i = start; i <= end; i++) {
    arr.push(i)
  }

  return arr
}

// @Injectable()
// export class NxDateFnsDateAdapter extends DateAdapter<Date> {
//   addCalendarDays(date: Date, days: number): Date {
//     return addDays(date, days)
//   }

//   addCalendarMonths(date: Date, months: number): Date {
//     return addMonths(date, months)
//   }

//   addCalendarYears(date: Date, years: number): Date {
//     return addYears(date, years)
//   }

//   clone(date: Date): Date {
//     return toDate(date)
//   }

//   createDate(year: number, month: number, date: number): Date {
//     return new Date(year, month, date)
//   }

//   format(date: Date, displayFormat: any): string {
//     return format(date, displayFormat, {
//       locale,
//     })
//   }

//   getDate(date: Date): number {
//     return getDate(date)
//   }

//   getDateNames(): string[] {
//     return range(1, 31).map((day) => String(day))
//   }

//   getDayOfWeek(date: Date): number {
//     return parseInt(format(date, 'i'), 10)
//   }

//   getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
//     const map = {
//       long: 'EEEE',
//       short: 'E..EEE',
//       narrow: 'EEEEE',
//     }

//     let formatStr = map[style]
//     let date = new Date()

//     return range(0, 6).map((month) =>
//       format(setDay(date, month), formatStr, {
//         locale,
//       })
//     )
//   }

//   getFirstDayOfWeek(): number {
//     return WEEK_STARTS_ON
//   }

//   getMonth(date: Date): number {
//     return getMonth(date)
//   }

//   getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
//     const map = {
//       long: 'LLLL',
//       short: 'LLL',
//       narrow: 'LLLLL',
//     }

//     let formatStr = map[style]
//     let date = new Date()

//     return range(0, 11).map((month) =>
//       format(setMonth(date, month), formatStr, {
//         locale,
//       })
//     )
//   }

//   getNumDaysInMonth(date: Date): number {
//     return getDaysInMonth(date)
//   }

//   getYear(date: Date): number {
//     return getYear(date)
//   }

//   getYearName(date: Date): string {
//     return format(date, 'yyyy', {
//       locale,
//     })
//   }

//   invalid(): Date {
//     return new Date(NaN)
//   }

//   isDateInstance(obj: any): boolean {
//     return obj instanceof Date
//   }

//   isValid(date: Date): boolean {
//     return date instanceof Date && !isNaN(date.getTime())
//   }

//   parse(value: any, parseFormat: any): Date | null {
//     return parse(value, parseFormat, new Date(), {
//       locale,
//     })
//   }

//   toIso8601(date: Date): string {
//     return date.toISOString()
//   }

//   today(): Date {
//     return new Date()
//   }
// }
