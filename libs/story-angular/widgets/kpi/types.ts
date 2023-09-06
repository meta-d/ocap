import { Intent } from "@metad/core"

export interface NxWidgetKPIOptions {
  icon: string
  unit?: string
  unitSemantics?: 'currency-code' | 'unit-of-measure' | string
  layoutDirection?: 'row' | 'column'
  digitsInfo?: string
  shortNumber?: boolean
  locale?: string
  additionalDataPoint?: {
    value: 'Value' | 'TargetValue' | 'ForecastValue' | 'ReferenceValue' | 'Deviation'
  }
  showDeviation?: boolean
  showDeviationText?: boolean
  deviationText?: string

  valueText: string
  targetText: string

  intent?: Intent
}
