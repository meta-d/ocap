import { CalculatedProperty, CalculationType } from '@metad/ocap-core'
import { serializeCalculationProperty } from './calculation'

describe('serializeCalculationProperty', () => {
  it('#serializeCalculationProperty', () => {
    expect(
      serializeCalculationProperty(
        {
          name: 'rato',
          calculationType: CalculationType.Calculated,
          formula: `"measure1" / "measure2"`
        } as CalculatedProperty,
        ''
      )
    ).toEqual(`"measure1" / "measure2"`)
  })
})
