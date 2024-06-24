import { Signal, inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CalculationSchema } from '@metad/core'
import {
  AggregationProperty,
  C_MEASURES,
  CalculatedProperty,
  CalculationType,
  CompareToEnum,
  DataSettings,
  MeasureControlProperty,
  RestrictedMeasureProperty,
  VarianceMeasureProperty
} from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import {
  ConditionalAggregationSchema,
  MeasureControlSchema,
  RestrictedMeasureSchema,
  VarianceMeasureSchema
} from '../schema'

export function injectCreateFormulaMeasureTool(
  dataSettings: Signal<DataSettings>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'createFormulaMeasure',
    description: 'Create or edit calculated measure for cube.',
    schema: CalculationSchema,
    func: async ({ __id__, name, caption, formula }) => {
      const key = __id__ || nanoid()
      const _dataSettings = dataSettings()
      const calculation = {
        __id__: key,
        name,
        caption,
        calculationType: CalculationType.Calculated,
        formula
      } as CalculatedProperty
      storyService.addCalculationMeasure({ dataSettings: _dataSettings, calculation })

      logger.debug(`Calculation measure created: `, _dataSettings, calculation)

      callback(_dataSettings, key)

      return `Formula calculation measure created!`
    }
  })

  return createFormulaTool
}

export function injectCreateRestrictedMeasureTool(
  defaultDataSettings: Signal<DataSettings>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createRestrictedMeasureTool = new DynamicStructuredTool({
    name: 'createRestrictedMeasure',
    description: 'Create or edit restricted measure for cube.',
    schema: RestrictedMeasureSchema,
    func: async (property) => {
      const key = property.__id__ || nanoid()
      const dataSettings = defaultDataSettings()
      storyService.addCalculationMeasure({
        dataSettings,
        calculation: {
          ...property,
          __id__: key,
          calculationType: CalculationType.Restricted
        } as RestrictedMeasureProperty
      })

      logger.debug(`Restricted calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Restricted calculation measure created!`
    }
  })

  return createRestrictedMeasureTool
}

export function injectCreateConditionalAggregationTool(
  defaultDataSettings: Signal<DataSettings>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createConditionalAggregationTool = new DynamicStructuredTool({
    name: 'createConditionalAggregation',
    description: 'Create conditional aggregation measure for cube.',
    schema: ConditionalAggregationSchema,
    func: async (property) => {
      const key = property.__id__ || nanoid()
      const dataSettings = defaultDataSettings()
      storyService.addCalculationMeasure({
        dataSettings,
        calculation: {
          ...property,
          __id__: key,
          calculationType: CalculationType.Aggregation
        } as AggregationProperty
      })

      logger.debug(`Conditional aggregation calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Conditional aggregation calculation measure created!`
    }
  })

  return createConditionalAggregationTool
}

export function injectCreateVarianceMeasureTool(
  defaultDataSettings: Signal<DataSettings>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)
  const createVarianceMeasureTool = new DynamicStructuredTool({
    name: 'createVarianceMeasure',
    description: 'Create variance measure for cube.',
    schema: VarianceMeasureSchema,
    func: async (property) => {
      const key = property.__id__ || nanoid()
      const dataSettings = defaultDataSettings()
      storyService.addCalculationMeasure({
        dataSettings,
        calculation: {
          ...property,
          measure: {
            ...property.measure,
            dimension: C_MEASURES
          },
          compareA: {
            type: CompareToEnum.CurrentMember
          },
          __id__: key,
          calculationType: CalculationType.Variance
        } as VarianceMeasureProperty
      })

      logger.debug(`Variance calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Variance calculation measure created!`
    }
  })

  return createVarianceMeasureTool
}

export function injectCreateMeasureControlTool(
  defaultDataSettings: Signal<DataSettings>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createMeasureControlTool = new DynamicStructuredTool({
    name: 'createMeasureControl',
    description: 'Create measures control to select actual measure in runtime',
    schema: MeasureControlSchema,
    func: async (property) => {
      const key = property.__id__ || nanoid()
      const dataSettings = defaultDataSettings()

      storyService.addCalculationMeasure({
        dataSettings,
        calculation: {
          ...property,
          __id__: key,
          calculationType: CalculationType.MeasureControl
        } as MeasureControlProperty
      })

      logger.debug(`Measure control calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Measure control calculation created!`
    }
  })

  return createMeasureControlTool
}
