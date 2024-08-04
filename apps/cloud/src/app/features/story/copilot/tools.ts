import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import {
  DataSettingsSchema,
  DimensionMemberSchema,
  markdownModelCube,
  MeasureSchema,
  SlicerSchema,
  tryFixSlicer,
  VariableSchema
} from '@metad/core'
import { DataSettings, omit } from '@metad/ocap-core'
import { FilterControlType, NxStoryService, WidgetComponentType } from '@metad/story/core'
import {
  chartAnnotationCheck,
  ChartSchema,
  tryFixAnalyticsAnnotation,
  completeChartAnnotation,
  createTableWidgetSchema,
  createWidgetSchema,
  KPIStylingSchema
} from '@metad/story/story'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import z from 'zod'

/**
 * Select default cube
 */
export function injectPickCubeTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const pickCubeTool = new DynamicStructuredTool({
    name: 'pickCube',
    description: 'Pick a cube.',
    schema: z.object({}),
    func: async () => {
      logger.debug(`Execute copilot action 'pickCube'`)
      try {
        const result = await storyService.openDefultDataSettings()
        const cube = result?.entities[0]
        if (result?.dataSource && cube) {
          const entityType = await firstValueFrom(
            storyService.selectEntityType({ dataSource: result.dataSource, entitySet: cube })
          )
          return markdownModelCube({ modelId: result.modelId, dataSource: result.dataSource, cube: entityType })
        }
        return ''
      } catch(err: any) {
        console.error(err)
        return `Error: ${err.message}`
      }
    }
  })

  return pickCubeTool
}

/**
 * Create filter bar widget
 */
export function injectCreateFilterBarTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createFilterBar',
    description: 'Create a filter bar widget in story dashboard.',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        dimensions: z.array(DimensionMemberSchema)
      })
    }),
    func: async ({ dataSettings, widget }) => {
      logger.debug(`Execute copilot action 'createFilterBar' using dataSettings:`, dataSettings, `widget:`, widget)
      try {
        storyService.createStoryWidget({
          ...omit(widget, 'dimensions'),
          dataSettings: {
            ...dataSettings,
            selectionFieldsAnnotation: {
              propertyPaths: widget.dimensions
            }
          },
          component: WidgetComponentType.FilterBar
        })
      } catch (error: any) {
        return `Error while creating the filter bar: ${error.message}`
      }

      return `The new filter bar widget has been created!`
    }
  })
}

/**
 * Create KPI widget
 */
export function injectCreateKPITool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createKPI',
    description: 'Create a KPI widget in story dashboard.',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        kpiValue: MeasureSchema,
        kpiTarget: MeasureSchema.optional()
      }),
      styling: KPIStylingSchema,
      options: z.object({
        shortNumber: z.boolean().optional().describe('Format the kpi value as short number'),
        digitsInfo: z.string().default('0.1-1').optional().describe('The digits format of kpi value')
      }).optional()
    }),
    func: async ({ dataSettings, widget, styling, options }) => {
      logger.debug(`Execute copilot action 'createKPI' using dataSettings:`, dataSettings, `widget:`, widget, `options`, options, `styling`, styling)
      try {
        storyService.createStoryWidget({
          ...omit(widget, 'kpiValue', 'kpiTarget'),
          dataSettings: {
            ...dataSettings,
            KPIAnnotation: {
              DataPoint: {
                Value: widget.kpiValue,
                TargetValue: widget.kpiTarget
              }
            }
          },
          options,
          styling,
          component: WidgetComponentType.KpiCard
        })
      } catch (error: any) {
        return `Error while creating the kpi widget: ${error.message}`
      }

      return `The new kpi widget has been created!`
    }
  })
}

/**
 * Create variable input control widget
 */
export function injectCreateVariableTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createVariableControl',
    description: 'Create a input control widget for cube variable',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        variable: VariableSchema.describe('variable')
      })
    }),
    func: async ({ dataSettings, widget }) => {
      logger.debug(
        `Execute copilot action 'createVariableControl' using dataSettings:`,
        dataSettings,
        `widget:`,
        widget
      )

      try {
        storyService.createStoryWidget({
          ...omit(widget, 'variable'),
          dataSettings: {
            ...dataSettings,
            dimension: {
              dimension: widget.variable?.variable
            }
          },
          options: {
            controlType: FilterControlType.DropDownList
          },
          component: WidgetComponentType.InputControl
        })
      } catch (error: any) {
        return `Error while creating the input control: ${error.message}`
      }

      return `The new input control widget has been created!`
    }
  })
}

/**
 * Create input control widget
 */
export function injectCreateInputControlTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createInputControl',
    description: 'Create a input control widget for dimension',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        dimension: DimensionMemberSchema
      })
    }),
    func: async ({ dataSettings, widget }) => {
      logger.debug(`Execute copilot action 'createInputControl' using dataSettings:`, dataSettings, `widget:`, widget)

      try {
        storyService.createStoryWidget({
          ...omit(widget, 'dimension'),
          dataSettings: {
            ...dataSettings,
            dimension: widget.dimension
          },
          options: {},
          component: WidgetComponentType.InputControl
        })
      } catch (error: any) {
        return `Error while creating the input control: ${error.message}`
      }

      return `The new input control widget has been created!`
    }
  })
}

/**
 * Create chart widget
 */
export function injectCreateChartTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createChartTool = new DynamicStructuredTool({
    name: 'createChartWidget',
    description: 'Create a new or edit widget in story page.',
    schema: z.object({
      key: z.string().optional().describe('Current widget key'),
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        chart: ChartSchema.describe('Chart configuration'),
        slicers: z.array(
          SlicerSchema
        )
        .optional()
        .describe('The slicers used by the chart data')
      }),
    }),
    func: async ({ key, dataSettings, widget }) => {
      logger.debug(
        '[Story] [AI Copilot] [Command tool] [createChart] inputs:', key,
        'dataSettings:',
        dataSettings,
        'position:',
        widget,
        'widget:',
      )

      const entityType = await firstValueFrom(storyService.selectEntityType(dataSettings as DataSettings))

      try {
        if (key) {
          storyService.updateWidget({
            widgetKey: key,
            widget: {
              ...widget,
              dataSettings: {
                ...(dataSettings ?? {}),
                chartAnnotation: completeChartAnnotation(chartAnnotationCheck(widget.chart, entityType)),
                selectionVariant: {
                  selectOptions: (widget.slicers ?? ((<any>widget.chart).slicers as any[]))?.map((slicer) =>
                    tryFixSlicer(slicer, entityType)
                  )
                }
              }
            }
          })
          return `The new chart widget has been created!`
        } else {
          storyService.createStoryWidget({
            component: WidgetComponentType.AnalyticalCard,
            position: widget.position ?? { x: 0, y: 0, rows: 5, cols: 5 },
            title: widget.title,
            dataSettings: {
              ...(dataSettings ?? {}),
              chartAnnotation: completeChartAnnotation(chartAnnotationCheck(widget.chart, entityType)),
              selectionVariant: {
                selectOptions: (widget.slicers ?? ((<any>widget.chart).slicers as any[]))?.map((slicer) =>
                  tryFixSlicer(slicer, entityType)
                )
              }
            }
          })
          return `The new chart widget has been created!`
        }
      } catch (error) {
        return `Error: ${error}`
      }
    }
  })

  return createChartTool
}

/**
 * Create table widget
 * 
 */
export function injectCreateTableTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const createTableTool = new DynamicStructuredTool({
    name: 'createTableWidget',
    description: 'Create a new or edit table widget.',
    schema: z.object({
      key: z.string().optional().describe('Current widget key'),
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema(createTableWidgetSchema())
    }),
    func: async ({key, dataSettings, widget}) => {
      logger.debug(
        '[Story] [AI Copilot] [Command tool] [createTableWidget] inputs:',
        key,
        dataSettings,
        widget,
      )

      const entityType = await firstValueFrom(storyService.selectEntityType(dataSettings as DataSettings))

      try {
        if (key) {
          storyService.updateWidget({
            widgetKey: key,
            widget: {
              ...widget,
              component: WidgetComponentType.AnalyticalGrid,
              dataSettings: {
                ...(dataSettings ?? {}),
                analytics: tryFixAnalyticsAnnotation(widget.analytics, entityType)
              },
            }
          })

          return `Current widget ${key} has been modified!`
        } else {
          const key = nanoid()
          storyService.createStoryWidget({
            key,
            ...widget,
            component: WidgetComponentType.AnalyticalGrid,
            dataSettings: {
              ...(dataSettings ?? {}),
              analytics: tryFixAnalyticsAnnotation(widget.analytics, entityType)
            },
          })
        return `Story table widget '${key}' created!`
      }
      } catch (error: any) {
        return `Error: ${error.message}`
      }
    }
  })

  return createTableTool
}
