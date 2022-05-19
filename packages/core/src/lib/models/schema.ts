// import { EntityProperty } from "./property"

// export interface Cube {
//   __id__?: string
//   name: string
//   label?: string
//   Table: Table[] | Table
//   DimensionUsage?: DimensionUsage[]
//   Dimension: Dimension[]
//   Measure: Measure[]
//   CalculatedMember?: CalculatedMember[]
// }

// export interface Table {
//   name: string
// }

// /**
//  * Mondrian 仅支持三种 Dimension 类型,
//  * 更丰富的语义可以通过 Semantics 来定义
//  */
// export enum DimensionType {
//   StandardDimension = 'StandardDimension',
//   TimeDimension = 'TimeDimension',
//   MeasuresDimension = 'MeasuresDimension'
// }

// export interface Dimension {
//   __id__?: string
//   name: string
//   label?: string
//   foreignKey?: string
//   type?: DimensionType
//   caption?: string
//   description?: string
//   Hierarchy: Hierarchy[]
// }

// export interface DimensionUsage {
//   __id__?: string
//   name: string
//   source: string
//   foreignKey: string
//   caption?: string
//   description?: string
// }

// export interface Hierarchy {
//   __id__?: string
//   name?: string
//   label?: string
//   hasAll: boolean
//   allMemberName?: string
//   defaultMember?: string
//   primaryKey: string
//   primaryKeyTable?: string
//   Table?: Table[] | Table
//   Level?: Level[]
//   Join?: Join
// }

// export interface Level {
//   __id__?: string
//   name: string
//   label?: string
//   column: string
//   nameColumn?: string
//   ordinalColumn?: string
//   parentColumn?: string
//   nullParentValue?: number
//   uniqueMembers: boolean
//   type?: string
//   table?: string
//   Closure?: Closure
//   KeyExpression?: KeyExpression
//   NameExpression?: NameExpression
//   CaptionExpression?: CaptionExpression
//   OrdinalExpression?: OrdinalExpression
//   ParentExpression?: ParentExpression
//   Property?: Property[]
//   __Attributes__?: EntityProperty
// }

// export interface SQLExpression {
//   SQL: SQL
// }

// export interface KeyExpression {
//   SQL: SQL
// }

// export interface NameExpression {
//   SQL: SQL
// }

// export interface CaptionExpression {
//   SQL: SQL
// }

// export interface OrdinalExpression {
//   SQL: SQL
// }

// export interface ParentExpression {
//   SQL: SQL
// }

// export interface SQL {
//   dialect: string
//   _: string
// }

// export interface Property {
//   name: string
//   column: string
//   PropertyExpression?: SQLExpression
// }

// export interface Closure {
//   parentColumn: string
//   childColumn: string
//   Table: Table
// }

// export interface Measure {
//   __id__?: string
//   name: string
//   caption?: string
//   label?: string
//   column: string
//   aggregator?: string
//   formatString?: string
//   MeasureExpression?: MeasureExpression
// }

// export interface MeasureExpression {
//   SQL: SQL
// }

// export interface CalculatedMember {
//   __id__?: string
//   name: string
//   caption?: string
//   description?: string
//   dimension?: string
//   hierarchy?: string
//   formula: string
//   Formula?: string[]
//   parent?: string
//   visible?: boolean
//   CalculatedMemberProperty?: CalculatedMemberProperty[]
// }

// export interface CalculatedMemberProperty {
//   name: string
//   caption?: string
//   description?: string
//   expression?: string
//   value: string
// }

// export interface NamedSet {
//   name: string
//   caption?: string
//   description?: string
//   formula?: string
//   Formula?: string[]
// }

// export interface Join {
//   leftKey: string
//   rightAlias: string
//   rightKey: string
//   Table: Table | Table[]
//   Join?: Join
// }

// // VirtualCube
// export interface VirtualCube {
//   CubeUsages: CubeUsages
//   VirtualCubeDimension: VirtualCubeDimension[]
//   VirtualCubeMeasure: VirtualCubeMeasure[]
//   CalculatedMember: CalculatedMember[]
// }

// export interface CubeUsages {
//   CubeUsage: CubeUsage
// }

// export interface CubeUsage {
//   cubeName: string
//   ignoreUnrelatedDimensions: boolean
// }

// export interface VirtualCubeDimension {
//   cubeName: string
//   name: string
// }

// export interface VirtualCubeMeasure {
//   cubeName: string
//   name: string
//   visible: boolean
// }
