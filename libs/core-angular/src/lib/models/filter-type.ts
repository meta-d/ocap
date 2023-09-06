import {
  DataSettings,
  Dimension,
  EntityType,
  getEntityCalendarHierarchy,
  ISlicer,
  Filter,
  FilterOperator,
  PropertyName,
  RecursiveHierarchyType,
  TimeGranularity
} from '@metad/ocap-core'
import { ControlType, TypeAhead } from './control-type'
import { NxISelectOption } from './select-option'
import { SmartEntityDataOptions } from './smart-entity'

/**
 * @deprecated use {@link FilterSelectionType}
 */
export enum InputControlSelectionType {
  Multiple = 'Multiple',
  Single = 'Single'
}

// export enum FilterExpressionType {
//   Multiple = 'Multiple',
//   Single = 'Single',
//   SingleInterval = 'SingleInterval',
//   SingleRange = 'SingleRange'
// }

// export interface FilterRestrictions {
//   nonFilterableProperties: string[]
//   requiredProperties: string[]
//   filterExpressionRestrictions: {
//     property: PropertyName
//     // allowedExpressions: FilterExpressionType
//   }[]
// }

/**
 * 树状结构的选择模式
 */
export enum TreeSelectionMode {
  Individual = 'Individual', // 每个节点独立选择
  ParentOnly = 'ParentOnly', // 只输出 Parent
  LeafOnly = 'LeafOnly', // 只输出 Leaf
  ParentChild = 'ParentChild' // 输出所有选中的 Parent 和 Children
}

export interface PropertyOptions {
  propertyName?: Dimension
}

export type PropertyFilterOptions = Partial<{
  dataSettings: DataSettings
  allowViewerModify: boolean
  allowViewersDelete: boolean
  selctionType: InputControlSelectionType
  selectionMode: TreeSelectionMode
}> &
  PropertyOptions

/**
 * @deprecated 使用 ISlicer
 */
export interface SelectedMemberOptions extends PropertyOptions {
  excludeSelected?: boolean
  selectedMembers: Array<NxISelectOption>
}

export enum PresentationEnum {
  Flat,
  Hierarchy
}

/**
 * @deprecated
 */
export interface PropertyValueHelpOptions extends PropertyFilterOptions {
  // displayBehaviour?: DisplayBehaviour
  presentation?: PresentationEnum
  showUnbooked?: boolean
  showOnlyLeaves?: boolean
  hideInControls?: boolean
  // selectedMemberOptions: SelectedMemberOptions
  slicer: ISlicer
}

// /**
//  * @deprecated 使用 TimeRangesSlicer
//  */
// export interface PropertyTimeRangesOptions extends PropertyFilterOptions {
//   currentDate: string
//   ranges: Array<TimeRange>
// }

// export interface TimeRangesSlicer extends ISlicer {
//   currentDate: string
//   ranges: Array<TimeRange>
// }

// export enum ValueListSource {
//   CUBE = 'CUBE',
//   DIMENSION = 'DIMENSION'
// }

export interface SmartFilterDataOptions<T> extends SmartEntityDataOptions<T>, PropertyOptions {
  typeAhead: TypeAhead
  // the data source of value list members
  // valueListSource: ValueListSource
  // for members
  recursiveHierarchy: RecursiveHierarchyType
  // 是否支持级联过滤
  cascadingEffect: boolean
  // 是否显示 All 成员
  showAllMember: boolean
}

export interface FilterOptions {
  label?: string
  placeholder?: string
  presentation?: PresentationEnum
  selctionType: InputControlSelectionType
  searchable: boolean
}

// export interface SmartFilterOptions<T = any> extends FilterOptions {
//   propertyName: PropertyPath
//   controlType: ControlType
//   typeAhead: TypeAhead
//   autoActiveFirstOption: boolean
//   maxTagCount?: number
//   // for hierarchy tree
//   initialHierarchyLevel: number
  
// }

export interface SmartFilterBarDataOptions extends SmartEntityDataOptions<unknown> {
  dataSettings: DataSettings
  filters: Array<Partial<SmartFilterDataOptions<unknown>>>
  today: {
    enable: boolean
    granularity: TimeGranularity
  }
}
