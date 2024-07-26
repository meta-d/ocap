import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NxStoryService, StoryPointType } from '@metad/story/core'
import { StoryPageSchema } from '@metad/story/story'
import { GridsterConfig } from 'angular-gridster2'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { MinCols, MinRows } from './types'

export function injectCreatePageTools() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  return [
    new DynamicStructuredTool({
      name: 'createPage',
      description: 'Create a new page in story dashboard.',
      schema: z.object({
        page: StoryPageSchema
      }),
      func: async ({ page }) => {
        logger.debug(`Execute copilot action 'createPage':`, page)
        storyService.newStoryPage({
          ...page,
          type: StoryPointType.Canvas,
          gridOptions: {
            gridType: 'fit',
            minCols: page.gridOptions?.columns ?? MinCols,
            minRows: page.gridOptions?.rows ?? MinRows
          } as GridsterConfig
        })
        return `The new page be created!`
      }
    })
    // new DynamicStructuredTool({
    //   name: 'createWidget',
    //   description: 'Create a widget in story dashboard page.',
    //   schema: z.object({
    //     dataSettings: DataSettingsSchema,
    //     widget: createWidgetSchema({
    //       component: z
    //         .enum([
    //           WidgetComponentType.AnalyticalCard,
    //           WidgetComponentType.AnalyticalGrid,
    //           WidgetComponentType.InputControl,
    //           WidgetComponentType.KpiCard,
    //           WidgetComponentType.FilterBar
    //         ])
    //         .describe('The component type of widget')
    //     })
    //   }),
    //   func: async ({ dataSettings, widget }) => {
    //     logger.debug(
    //       `Execute copilot action 'createWidget': '${widget.component}' using dataSettings:`,
    //       dataSettings,
    //       `widget:`,
    //       widget
    //     )
    //     storyService.createStoryWidget({
    //       ...widget,
    //       dataSettings,
    //       component: widget.component || WidgetComponentType.AnalyticalCard
    //     })

    //     return `The new widget be created!`
    //   }
    // })
  ]
}
