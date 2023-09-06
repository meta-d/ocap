import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addWeeks from 'date-fns/addWeeks'
import addYears from 'date-fns/addYears'
import format from 'date-fns/format'
import isDate from 'date-fns/isDate'
import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import subQuarters from 'date-fns/subQuarters'
import subWeeks from 'date-fns/subWeeks'
import subYears from 'date-fns/subYears'
import { Semantics } from './annotations'
import { EntityType, getEntityCalendarHierarchy } from './models'
import {
  AdvancedSlicer,
  Dimension,
  Drill,
  FilteringLogic,
  FilterOperator,
  getPropertyHierarchy,
  IFilter,
  IMember,
  isAdvancedFilter,
  isAdvancedSlicer,
  isFilter,
  ISlicer,
  Measure
} from './types'
import { compact, isArray, isNil, isString } from './utils'

// format
export const HTML5_FMT_DATETIME_LOCAL_SECONDS = `yyyy-MM-dd'T'HH:mm:ss`
export const HTML5_FMT_DATE = 'yyyy-MM-dd'

/**
 * 对 IFilter 过滤条件接口的便捷实现类
 */
export class Filter implements IFilter {
  name?: string
  drill?: Drill
  distance?: number

  exclude?: boolean

  constructor(
    public dimension: Dimension | Measure,
    public members: Array<IMember>,
    public operator: FilterOperator = FilterOperator.EQ,
    public and = true
  ) {}

  setName(value) {
    this.name = value
    return this
  }

  setAnd(value) {
    this.and = value
    return this
  }

  And() {
    this.and = true
    return this
  }

  Or() {
    this.and = false
    return this
  }
}

/**
 * 静默 filterContainer 发出的 filterAction 都为静默 filter
 */
export interface FilterAction {
  action: 'remove' | 'put' | 'refresh'
  // 是否为静默 filter 事件
  silent?: boolean
  params: any
}

export enum FilterMergeMode {
  ignore,
  replace,
  merge
}

export enum TimeGranularity {
  Year = 'Year',
  Quarter = 'Quarter',
  Month = 'Month',
  Week = 'Week',
  Day = 'Day'
  // @todo more
}

export enum TimeRangeType {
  Standard = 'Standard',
  Offset = 'Offset'
}

export enum OffSetDirection {
  LookBack = 'LookBack',
  LookAhead = 'LookAhead'
}

export interface TimeOffSet {
  current?: Date
  direction: OffSetDirection
  granularity: TimeGranularity
  amount: number
}

export interface TimeRange {
  type: TimeRangeType
  granularity: TimeGranularity
  current?: Exclude<TimeOffSet, 'granularity'>
  lookBack?: number
  lookAhead?: number
  selected?: boolean
  /**
   * 时间值的格式化字符串
   */
  formatter?: string
}

export interface TimeRangesSlicer extends ISlicer {
  currentDate: string
  ranges: Array<TimeRange>
}

/**
 * put Filter in array
 */
export function putFilter(filters: Array<ISlicer>, value: ISlicer | ISlicer[], mode?: FilterMergeMode): Array<ISlicer> {
  if (isArray(value)) {
    value.forEach((item) => {
      filters = putFilter(filters, item, mode)
    })
    return filters
  }

  let existed = false
  const ftrs = (filters || []).map((item) => {
    if (existed) {
      return item
    }

    if (item.dimension && getPropertyHierarchy(item.dimension) === getPropertyHierarchy(value.dimension)) {
      existed = true
      if (item.dimension.name === value.dimension.name) {
        // path 的 hierarchy 和 name 相同则覆盖
        return value
      }

      if (mode === FilterMergeMode.ignore) {
        return item
      } else if (mode === FilterMergeMode.merge) {
        //TODO
        return value
      }
      return value
    } else if (isAdvancedSlicer(value) && isAdvancedSlicer(item)) {
      existed = true
      return value
    }
    return item
  })

  // // 当 value 为 null 时视为移除此 filter
  // if (!isAdvancedFilter(value) && isNil(value.value)) {
  //   return ftrs
  // }
  if (!existed) {
    ftrs.push(value)
  }
  return ftrs
}

/**
 * remove Filter from array
 */
export function removeFilter(filters: Array<ISlicer>, value: ISlicer | string): Array<ISlicer> {
  if (isFilter(value)) {
    return filters.filter((item, i) => item.dimension.dimension !== value.dimension.dimension)
  } else {
    // remove by name or path
    return filters.filter((item) => item.dimension.dimension !== value)
  }
}

/**
 * 将 filter 转成可显示的 tag 字符串
 *
 * @deprecated use slicerAsString
 */
export function filterAsTag(ftr: IFilter): string {
  const value = getValueString(ftr.members)
  switch (ftr.operator) {
    case FilterOperator.BT:
      return `${ftr.members[0]}...${ftr.members[1]}`
    case FilterOperator.EQ:
      return ftr.members.map(({ value, label }) => `${label || getValueString(value)}`).join(', ')
    case FilterOperator.NE:
      return `≠${value}`
    case FilterOperator.LT:
      return `<${value}`
    case FilterOperator.LE:
      return `≤${value}`
    case FilterOperator.GT:
      return `>${value}`
    case FilterOperator.GE:
      return `≥${value}`
    case FilterOperator.Contains:
      return `*${value}*`
    case FilterOperator.EndsWith:
      return `*${value}`
    case FilterOperator.StartsWith:
      return `${value}*`
    default:
      return ''
  }
}

export function slicerAsString(slicer: ISlicer) {
  if (isAdvancedFilter(slicer)) {
    return `[${slicer.children
      .map((item) => slicerAsString(item))
      .join(slicer.filteringLogic === FilteringLogic.And ? ' & ' : ', ')}]`
  }

  if (isFilter(slicer)) {
    const value = getValueString(slicer.members[0]?.value)
    switch (slicer.operator) {
      case FilterOperator.BT:
        return `${slicer.members[0]?.value}...${slicer.members[1]?.value}`
      case FilterOperator.EQ:
        return slicer.members.map((member) => `${member.caption || member.label || getValueString(member.value)}`).join(', ')
      case FilterOperator.NE:
        return `≠${value}`
      case FilterOperator.LT:
        return `<${value}`
      case FilterOperator.LE:
        return `≤${value}`
      case FilterOperator.GT:
        return `>${value}`
      case FilterOperator.GE:
        return `≥${value}`
      case FilterOperator.Contains:
        return `*${value}*`
      case FilterOperator.EndsWith:
        return `*${value}`
      case FilterOperator.StartsWith:
        return `${value}*`
      default:
        return ''
    }
  }

  return slicer.members?.map((member) => `${member.caption || member.label || getValueString(member.value)}`).join(', ')
}

function getValueString(value) {
  if (isDate(value)) {
    return format(value, HTML5_FMT_DATE)
  }
  if (!isString(value)) {
    return `${value}`
  }
  return value ? (value.startsWith('datetime') ? value : `'${value}'`) : ''
}

export function filterAddValue(ftr, value, text) {
  isArray(ftr.value) ? ftr.value.push(value) : (ftr.value = [value])
  isArray(ftr.text) ? ftr.text.push(text) : (ftr.text = [text])
}

export function filterAddFilter(ftr, another) {
  if (isArray(another.value)) {
    another.value.forEach((value, i) => filterAddValue(ftr, value, another.text[i]))
  } else {
    filterAddValue(ftr, another.value, another.text)
  }
}

export const FILTER_OPERATOR_DESC = {
  All: '空',
  // Any: '任意',
  BT: '介于',
  EQ: '等于', //
  GE: '大于等于', //
  GT: '大于', //
  LE: '小于等于', //
  LT: '小于', //
  /**
   * FilterOperator "Not Between"
   * Used to filter all entries, which are not between the given boundaries.
   * The filter result does not contains the boundaries, but only entries outside of the boundaries.
   * The order of the entries in the filter results is based on their occurence in the input list.
   * Note, when used on strings: The String comparison is based on lexicographical ordering.
   * Characters are ranked in their alphabetical order.
   * Words with the same preceding substring are ordered based on their length e.g. "Chris" comes before "Christian".
   */
  // NB = 'NB',
  NE: '不等于', // not equals
  // NotContains = 'NotContains',    // not contains
  // NotEndsWith = 'NotEndsWith',    // not ends with
  // NotStartsWith = 'NotStartsWith',  // not starts with
  Contains: '包含', //
  StartsWith: '开始于', // starts with
  EndsWith: '结束于' //
}

// type Guards
export const isTimeRangesSlicer = (toBe): toBe is TimeRangesSlicer =>
  !isNil((toBe as TimeRangesSlicer)?.ranges) && !isNil((toBe as TimeRangesSlicer)?.currentDate)

// Helpers

export function mapTimeGranularitySemantic(granularity: TimeGranularity): Semantics {
  switch (granularity) {
    case TimeGranularity.Year:
      return Semantics['Calendar.Year']
    case TimeGranularity.Quarter:
      return Semantics['Calendar.Quarter']
    case TimeGranularity.Month:
      return Semantics['Calendar.Month']
    case TimeGranularity.Day:
      return Semantics['Calendar.Day']
    default:
      throw new Error(`Can't found semantics for granularity ${granularity}`)
  }
}

export function formatCurrentPeriod(current: number | Date, granularity: TimeGranularity, formatter?: string) {
  if (granularity === null || current === null) {
    return null
  }
  let _format = 'yyyMMdd'
  switch (granularity) {
    case TimeGranularity.Year:
      _format = 'yyyy'
      break
    case TimeGranularity.Quarter:
      _format = `yyyy'Q'Q`
      break
    case TimeGranularity.Month:
      _format = 'yyyyMM'
      break
    case TimeGranularity.Day:
      _format = 'yyyyMMdd'
      break
  }

  return format(current, formatter || _format)
}

export function calcOffset(currentDate: Date, { direction, granularity, amount }: Partial<TimeOffSet>): Date {
  amount = amount || 0
  switch (granularity) {
    case TimeGranularity.Year:
      if (direction === OffSetDirection.LookBack) {
        return subYears(currentDate, amount)
      } else {
        return addYears(currentDate, amount)
      }
    case TimeGranularity.Quarter:
      if (direction === OffSetDirection.LookBack) {
        return subQuarters(currentDate, amount)
      } else {
        return addQuarters(currentDate, amount)
      }
    case TimeGranularity.Month:
      if (direction === OffSetDirection.LookBack) {
        return subMonths(currentDate, amount)
      } else {
        return addMonths(currentDate, amount)
      }
    case TimeGranularity.Week:
      if (direction === OffSetDirection.LookBack) {
        return subWeeks(currentDate, amount)
      } else {
        return addWeeks(currentDate, amount)
      }
    case TimeGranularity.Day:
      if (direction === OffSetDirection.LookBack) {
        return subDays(currentDate, amount)
      } else {
        return addDays(currentDate, amount)
      }
    default:
      return currentDate
  }
}

export function formatRangeCurrentPeriod(current: Date, range: TimeRange) {
  if (range.type === TimeRangeType.Offset) {
    current = calcOffset(current, { ...range.current, granularity: range.granularity })
  }

  return formatCurrentPeriod(current, range.granularity, range.formatter)
}

export function calcRange(current: Date, range: TimeRange) {
  if (range.type === TimeRangeType.Offset) {
    current = calcOffset(current, { ...range.current, granularity: range.granularity })
  }

  return [
    formatCurrentPeriod(
      calcOffset(current, {
        direction: OffSetDirection.LookBack,
        granularity: range.granularity,
        amount: range.lookBack || 0
      }),
      range.granularity,
      range.formatter
    ),

    formatCurrentPeriod(
      calcOffset(current, {
        direction: OffSetDirection.LookAhead,
        granularity: range.granularity,
        amount: range.lookAhead || 0
      }),
      range.granularity,
      range.formatter
    )
  ]
}

/**
 * Calculate time range slicer to common slicer base current date
 *  
 * @param currentDate 
 * @param timeSlicer 
 * @param entityType
 * @returns 
 */
export function workOutTimeRangeSlicers(
  currentDate: Date,
  timeSlicer: TimeRangesSlicer,
  entityType?: EntityType
): ISlicer[] {
  const property = getEntityCalendarHierarchy(entityType, timeSlicer.dimension)

  return timeSlicer.ranges.map((range) => {
    const calendarSemantic = mapTimeGranularitySemantic(range.granularity)
    const calendarLevel = property?.levels?.find((level) => level.semantics?.semantic === calendarSemantic)
    const results = calcRange(currentDate || new Date(), {
      ...range,
      formatter: range.formatter || calendarLevel?.semantics?.formatter
    })

    if (results[0] === results[1]) {
      return {
        dimension: timeSlicer.dimension,
        members: [
          {
            value: results[0]
          }
        ]
      }
    }

    return {
      dimension: timeSlicer.dimension,
      members: results.map((value) => ({ value })),
      operator: FilterOperator.BT
    }
  })
}

export function advancedSlicerAsString(slicer: AdvancedSlicer, i18nOnContext?: string) {
  return `${slicer.operator}(${isArray(slicer.value) ? compact(slicer.value) : slicer.value},${slicer.measure}) ${
    i18nOnContext ?? 'on context'
  }:(${slicer.context.map(({ dimension }) => dimension)})`
}

export function timeRangesSlicerAsString(slicer: TimeRangesSlicer, i18nTimeRanges?: string) {
  return `${i18nTimeRanges ?? 'Time Ranges'}: ${slicer.ranges
    .map(
      (range) =>
        `${range.type}|${range.granularity}${
          range.type === TimeRangeType.Offset ? `(${range.current.direction}:${range.current.amount})` : ''
        }:[${range.lookBack ?? 0}, ${range.lookAhead ?? 0}]`
    )
    .join(' & ')}`
}
