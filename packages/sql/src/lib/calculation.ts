import {
  CalculationProperty,
  IMember,
  isAggregationProperty,
  isCalculatedProperty,
  isIndicatorMeasureProperty,
  Property,
  RestrictedMeasureProperty
} from '@metad/ocap-core'
import { convertSlicerToSQL } from './sql-filter'
import { serializeName } from './types'

export function serializeCalculationProperty(property: CalculationProperty, dialect: string) {
  let formula
  if (isAggregationProperty(property)) {
    formula = serializeAggregationProperty(property)
  } else if (isCalculatedProperty(property)) {
    formula = property.formula
  } else if (isIndicatorMeasureProperty(property)) {
    return serializeRestrictedMeasureProperty(property)
  } else {
    throw new Error(`UnImplemented calculation type ${property.calculationType}`)
  }
  return formula
}

function serializeAggregationProperty(property: Property) {
  console.log(property)
  return `TODO`
}

function serializeRestrictedMeasureProperty(property: RestrictedMeasureProperty, dialect?: string) {
  return [
    `SUM(${serializeName(property.measure, dialect)})`,
    property.dimensions.map((dimension) => {
      return convertSlicerToSQL(
        {
          dimension,
          members: dimension.members as Array<IMember>
        },
        dialect
      )
    })
  ]
}
