import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { DataSettingsSchema, DimensionSchema, markdownEntityType, MeasureSchema, VariableSchema } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { omit } from '@metad/ocap-core'
import { FilterControlType, NxStoryService, WidgetComponentType } from '@metad/story/core'
import { createWidgetSchema } from '@metad/story/story'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import z from 'zod'

export function injectPickCubeTool() {
  const logger = inject(NGXLogger)
  const dsCoreService = inject(NgmDSCoreService)
  const _dialog = inject(MatDialog)
  const storyService = inject(NxStoryService)

  const pickCubeTool = new DynamicStructuredTool({
    name: 'pickCube',
    description: 'Pick a cube.',
    schema: z.object({}),
    func: async () => {
      logger.debug(`Execute copilot action 'pickCube'`)

      const result = await storyService.openDefultDataSettings()

      const cube = result?.entities[0]
      if (result?.dataSource && cube) {
        const entityType = await firstValueFrom(
          storyService.selectEntityType({ dataSource: result.dataSource, entitySet: cube })
        )
        return `Use model id: '${result.modelId}' and cube: '${cube}'\n` + markdownEntityType(entityType)
      }

      return ''
    }
  })

  return pickCubeTool
}


export function injectCreateFilterBarTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createFilterBar',
    description: 'Create a filter bar widget in story dashboard.',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        dimensions: z.array(DimensionSchema),
      })
    }),
    func: async ({ dataSettings, widget }) => {
      logger.debug(
        `Execute copilot action 'createFilterBar' using dataSettings:`,
        dataSettings,
        `widget:`,
        widget
      )
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
      })
    }),
    func: async ({ dataSettings, widget }) => {
      logger.debug(
        `Execute copilot action 'createKPI' using dataSettings:`,
        dataSettings,
        `widget:`,
        widget
      )
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
          component: WidgetComponentType.KpiCard
        })
      } catch (error: any) {
        return `Error while creating the kpi widget: ${error.message}`
      }

      return `The new kpi widget has been created!`
    }
  })
}


export function injectCreateVariableTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return new DynamicStructuredTool({
    name: 'createVariableControl',
    description: 'Create a input control widget for cube variable',
    schema: z.object({
      dataSettings: DataSettingsSchema,
      widget: createWidgetSchema({
        variable: VariableSchema.describe('variable'),
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