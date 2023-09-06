import { ISlicer } from '../types'

export enum IndicatorType {
  /**
   * Basic type: aggregate measure by restrictive conditions
   */
  BASIC = 'BASIC',
  /**
   * Derive type: calculate by formula with / without restrictive conditions
   */
  DERIVE = 'DERIVE',
}

export interface Indicator {
  /**
   * System ID
   */
  id: string
  /**
   * Business code
   */
  code: string
  /**
   * Name
   */
  name: string
  /**
   * Semantic model id
   */
  modelId?: string
  /**
   * Cube
   */
  entity: string
  /**
   * Type of indicator
   */
  type?: IndicatorType
  /**
   * The calendar dimension or hierarchy
   */
  calendar?: string
  /**
   * Free dimensions
   */
  dimensions?: string[]
  /**
   * Slicer conditions
   */
  filters?: Array<ISlicer>
  /**
   * Measure for BASIC type
   */
  measure?: string
  /**
   * Formula for DERIVE type
   */
  formula?: string
  /**
   * Aggregator function for measure or formula
   */
  aggregator?: string
  /**
   * Unit of measure or formula
   */
  unit?: string
  /**
   * Is visible
   */
  visible?: boolean
}

/**
 * Calculate measure name in EntityType for the indicator
 * 
 * @param indicator 
 * @returns 
 */
export function getIndicatorMeasureName(indicator: Indicator) {
  const name = indicator.code || indicator.name
  return indicator.formula ? (name + '_formula') : indicator.measure
}
