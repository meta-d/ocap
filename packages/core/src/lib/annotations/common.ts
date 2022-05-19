// https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md

import { Annotation, PropertyName } from '../types'
export type AnnotationPath = string | Annotation
export type Decimal = number
export type Byte = number
export type NavigationPropertyPath = string

export type MediaType = 'video/mp4' | any

export type SimpleIdentifier = string
/**
 * The QualifiedName of an OData construct in scope
 */
export type QualifiedName = string
/**
 * The qualified name of an action with an optional overload
 *
 * The qualified name of an action optionally followed by parentheses containing the binding parameter type
 * of a bound action overload to identify that bound overload, or by empty parentheses to identify the unbound overload.
 */
export type ActionOverload = string

export interface ValueListType {
  //
}

/**
 * Maps a property of the annotated entity type or a sibling property of the annotated property to a property of the Semantic Object
 */
export interface SemanticObjectMappingType {
  /**
   * Path to a local property that provides the value for the Semantic Object property
   */
  localProperty: PropertyName
  /**
   * Name of the Semantic Object property
   */
  semanticObjectProperty: string
}

export interface NumberFormat {
  ScaleFactor: Decimal
  NumberOfFractionalDigits: Byte
}

/**
 * [odata-vocabularies/CriticalityType](https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#CriticalityType)
 */
export enum CriticalityType {
  VeryNegative = 'VeryNegative', // Very negative / dark-red status - risk - out of stock - late
  Neutral = 'Neutral', // Neutral / grey status - inactive - open - in progress
  Negative = 'Negative', // Negative / red status - attention - overload - alert
  Critical = 'Critical', // Critical / orange status - warning
  Positive = 'Positive', // Positive / green status - completed - available - on track - acceptable
  VeryPositive = 'VeryPositive' // Very positive / blue status - above max stock - excess
}

export enum TrendType {
  StrongUp = 'StrongUp', // Value grows strongly
  Up = 'Up', // Value grows
  Sideways = 'Sideways', // Value does not significantly grow or shrink
  Down = 'Down', // Value shrinks
  StrongDown = 'StrongDown' // Value shrinks strongly
}

/**
 * DataPointType 的数据显示形式
 */
export enum VisualizationType {
  Number = 'Number', // Visualize as a number
  BulletChart = 'BulletChart', // Visualize as bullet chart - requires TargetValue
  Progress = 'Progress', // Visualize as progress indicator - requires TargetValue
  Rating = 'Rating', // Visualize as partially or completely filled stars/hearts/... - requires TargetValue
  Donut = 'Donut', // Visualize as donut, optionally with missing segment - requires TargetValue
  DeltaBulletChart = 'DeltaBulletChart' // Visualize as delta bullet chart - requires TargetValue
}

export enum ImprovementDirectionType {
  Minimize = 'Minimize', // Lower is better
  Target = 'Target', // Closer to the target is better
  Maximize = 'Maximize' // Higher is better
}

/**
 * 支持 ge le between ?
 */
export interface ReferencePeriod {
  Description?: string
  Start: Date
  End: Date
}
