import { Dimension, Measure, PrimitiveType } from '../types'
import { isNil } from '../utils'
import {
  ActionOverload,
  CriticalityType,
  ImprovementDirectionType,
  MediaType,
  NumberFormat,
  VisualizationType,
  QualifiedName,
  ReferencePeriod,
  SemanticObjectMappingType,
  TrendType,
  AnnotationPath,
  Decimal,
  NavigationPropertyPath,
} from './common'
import { ContactType } from './communication'

export type IdentificationAnnotation = Array<DataFieldAbstract>

export enum OperationGroupingType {
  /**
   * Invoke each action in isolation from other actions
   */
  Isolated = 0,
  /**
   * Group all actions into a single change set
   */
  ChangeSet = 1,
}

export enum CriticalityRepresentationType {
  /**
   * Criticality is represented with an icon
   */
  WithIcon = 0,

  /**
   * Criticality is represented without icon, e.g. only via text color
   */
  WithoutIcon = 1,

  /**
   * Criticality is represented only by using an icon
   * @Experimental
   */
  OnlyIcon = 2,
}

/**
 * Elementary building block that represents a piece of data and/or allows triggering an action
 *
 * By using the applicable terms UI.Hidden, UI.Importance or HTML5.CssDefaults, the visibility,
 * the importance and and the default css settings (as the width) of the data field can be influenced.
 *
 * ## Derived Types: {@link DataFieldForAnnotation}
 * * {@link DataFieldForAnnotation}
 * * {@link DataFieldForActionAbstract}
 *  * {@link DataFieldForAction}
 *  * {@link DataFieldForIntentBasedNavigation}
 * * {@link DataField}
 *  * {@link DataFieldWithAction}
 *  * {@link DataFieldWithIntentBasedNavigation}
 *  * {@link DataFieldWithNavigationPath}
 *  * {@link DataFieldWithUrl}
 */
export interface DataFieldAbstract {
  /**
   * A short, human-readable text suitable for labels and captions in UIs
   */
  label?: string
  /**
   * Criticality of the data field value
   */
  criticality?: CriticalityType
  /**
   * Decides if criticality is visualized in addition by means of an icon
   */
  criticalityRepresentation?: CriticalityRepresentationType
  /**
   * Optional icon
   */
  iconUrl?: URL
}

export interface DataFieldForAnnotation extends DataFieldAbstract {
  target: AnnotationPath | DataPointType
}

/**
 * Triggers an action
 *
 * ## Derived Types:
 * * {@link DataFieldForAction}
 * * {@link DataFieldForIntentBasedNavigation}
 */
export interface DataFieldForActionAbstract extends DataFieldAbstract {
  /**
   * Action should be placed close to (or even inside) the visualized term
   */
  inline: boolean
  /**
   * Determines whether the action completes a process step (e.g. approve, reject).
   */
  determining: boolean
}

/**
 * Triggers an OData action
 *
 * The action is NOT tied to a data value (in contrast to {@link DataFieldWithAction}).
 */
export interface DataFieldForAction extends DataFieldForActionAbstract {
  /**
   * Qualified name of an Action, Function, ActionImport or FunctionImport in scope
   */
  action: ActionOverload
  /**
   * Expresses how invocations of this action on multiple instances should be grouped
   */
  invocationGrouping: OperationGroupingType
}

/**
 * Triggers intent-based UI navigation
 *
 * The navigation intent is is expressed as a Semantic Object and optionally an Action on that object.
 * It is NOT tied to a data value (in contrast to {@link DataFieldWithIntentBasedNavigation}).
 */
export interface DataFieldForIntentBasedNavigation extends DataFieldForActionAbstract {
  /**
   * Name of the Semantic Object
   */
  semanticObject: string
  /**
   * Name of the Action on the Semantic Object. If not specified, let user choose which of the available actions to trigger.
   */
  action: string
  /**
   * Determines whether a context needs to be passed to the target of this navigation.
   */
  requiresContext: boolean
  /**
   * Maps properties of the annotated entity type to properties of the Semantic Object
   */
  mapping: SemanticObjectMappingType[]
}

/**
 * A piece of data
 *
 * ## Derived Types:
 * * {@link DataFieldWithAction}
 * * {@link DataFieldWithIntentBasedNavigation}
 * * {@link DataFieldWithNavigationPath}
 * * {@link DataFieldWithUrl}
 */
export interface DataField extends DataFieldAbstract {
  /**
   * The data field's value
   */
  value: PrimitiveType
}

/**
 * A piece of data that allows triggering an OData action
 *
 * The action is tied to a data value which should be rendered as a hyperlink.
 * This is in contrast to {@link DataFieldForAction} which is not tied to a specific data value.
 */
export interface DataFieldWithAction extends DataField {
  /**
   * Qualified name of an Action, Function, ActionImport or FunctionImport in scope
   */
  action: QualifiedName
}

/**
 * A piece of data that allows triggering intent-based UI navigation
 *
 * The navigation intent is is expressed as a Semantic Object and optionally an Action on that object.
 *
 * It is tied to a data value which should be rendered as a hyperlink.
 * This is in contrast to {@link DataFieldForIntentBasedNavigation} which is not tied to a specific data value.
 */
export interface DataFieldWithIntentBasedNavigation extends DataField {
  /**
   * Name of the Semantic Object
   */
  semanticObject: string
  /**
   * Name of the Action on the Semantic Object. If not specified, let user choose which of the available actions to trigger.
   */
  action: string
  /**
   * Maps properties of the annotated entity type to properties of the Semantic Object
   */
  mapping: SemanticObjectMappingType[]
}

/**
 * A piece of data that allows navigating to related data
 *
 * It should be rendered as a hyperlink
 */
export interface DataFieldWithNavigationPath extends DataField {
  /**
   * Contains either a navigation property or a term cast,
   * where term is of type Edm.EntityType or a concrete entity type or a collection of these types
   */
  target: NavigationPropertyPath
}

/**
 * A piece of data that allows navigating to other information on the Web
 *
 * It should be rendered as a hyperlink
 */
export interface DataFieldWithUrl extends DataField {
  /**
   * Target of the hyperlink
   */
  url: URL
  /**
   * Media type of the hyperlink target, e.g. video/mp4
   */
  urlContentType: MediaType
}

/**
 * DataPoint 数据类型
 * Reference [DataPointType](https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataPointType)
 */
export interface DataPointType {
  ID: string
  // Title of the data point
  Title: string
  // Short description
  Description?: string
  // Full description
  LongDescription?: string
  /**
   * Numeric value
   * The value is typically provided via a Path construct.
   * The path MUST lead to a direct property of the same entity type or a property of a complex property (recursively) of that entity type,
   * navigation segments are not allowed.
   * It could be annotated with either UoM.ISOCurrency or UoM.Unit. Percentage values are annotated with UoM.Unit = '%'.
   * A renderer should take an optional Common.Text annotation into consideration.
   */
  Value: Measure

  // Target value
  TargetValue?: PrimitiveType
  // Forecast value
  ForecastValue?: PrimitiveType
  // Minimum value (for output rendering)
  MinimumValue?: Decimal
  // Maximum value (for output rendering)
  MaximumValue?: Decimal
  // Number format
  ValueFormat?: NumberFormat
  // Preferred visualization
  Visualization?: VisualizationType
  SampleSize?: PrimitiveType
  // Reference period
  ReferencePeriod?: ReferencePeriod
  // Service-calculated criticality, alternative to CriticalityCalculation
  Criticality?: CriticalityType
  // Custom labels for the criticality legend. Annotation path MUST end in UI.CriticalityLabels
  CriticalityLabels?: AnnotationPath
  /**
   * Decides if criticality is visualized in addition by means of an icon
   * @Experimental
   */
  CriticalityRepresentation?: CriticalityRepresentationType
  // Parameters for client-calculated criticality, alternative to Criticality
  CriticalityCalculation?: Partial<CriticalityCalculationType>
  // Service-calculated trend, alternative to TrendCalculation
  Trend?: TrendType
  // Parameters for client-calculated trend, alternative to Trend
  TrendCalculation?: Partial<TrendCalculationType>
  // Contact person
  Responsible?: ContactType
}

export interface CriticalityThresholdsType {
  AcceptanceRangeLowValue: PrimitiveType // Lowest value that is considered positive
  AcceptanceRangeHighValue: PrimitiveType // Highest value that is considered positive
  ToleranceRangeLowValue: PrimitiveType // Lowest value that is considered neutral
  ToleranceRangeHighValue: PrimitiveType // Highest value that is considered neutral
  DeviationRangeLowValue: PrimitiveType // Lowest value that is considered critical
  DeviationRangeHighValue: PrimitiveType // Highest value that is considered critical
}

export interface CriticalityCalculationType extends CriticalityThresholdsType {
  ReferenceValue: PrimitiveType //  (Experimental)	Reference value for the calculation, e.g. number of sales for the last year
  IsRelativeDifference: PrimitiveType //  (Experimental)  Calculate with a relative difference
  ImprovementDirection: ImprovementDirectionType // Describes in which direction the value improves
  //  (Experimental)
  /** List of thresholds depending on the aggregation level as a set of constant values
   * Constant thresholds shall only be used in order to refine constant values
   * given for the data point overall (aggregation level with empty collection of property paths),
   * but not if the thresholds are based on other measure elements.
   */
  ConstantThresholds: NxLevelThresholdsType[]
}

export interface NxLevelThresholdsType extends CriticalityThresholdsType {
  // (Experimental)
  /**An unordered tuple of dimensions,
   * i.e. properties which are intended to be used for grouping in aggregating requests.
   * In analytical UIs, e.g. an analytical chart, the aggregation level typically corresponds to the visible dimensions.
   */
  AggregationLevel: Dimension[]
}

export interface TrendCalculationType {
  // ReferenceValuePath?: string
  ReferenceValue?: PrimitiveType
  IsRelativeDifference?: PrimitiveType
  UpDifference?: PrimitiveType
  StrongUpDifference?: PrimitiveType
  DownDifference?: PrimitiveType
  StrongDownDifference?: PrimitiveType
}

// type Guards
export const isDataFieldForAnnotation = (toBe): toBe is DataFieldForAnnotation => !isNil((toBe as DataFieldForAnnotation)?.target)
export const isDataFieldWithNavigationPath = (toBe): toBe is DataFieldWithNavigationPath =>
  !isNil((toBe as DataFieldWithNavigationPath)?.target) && !isNil((toBe as DataFieldWithNavigationPath).value)
export const isDataFieldWithIntentBasedNavigation = (toBe): toBe is DataFieldWithIntentBasedNavigation =>
  !isNil((toBe as DataFieldWithIntentBasedNavigation)?.semanticObject) && !isNil((toBe as DataFieldWithIntentBasedNavigation).value)
export const isDataPointType = (toBe): toBe is DataPointType => !isNil((toBe as DataPointType)?.Value)
// TODO More

export type LineItem = DataFieldAbstract[]
