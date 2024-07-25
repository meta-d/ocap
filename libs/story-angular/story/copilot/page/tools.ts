import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NxStoryService, StoryPointType, WidgetComponentType } from '@metad/story/core'
import { GridsterConfig } from 'angular-gridster2'
import { z } from 'zod'
import { createWidgetSchema, StoryPageSchema } from '../schema'
import { MinCols, MinRows } from './types'

export function injectCreatePageTools() {
  const storyService = inject(NxStoryService)

  return [
    new DynamicStructuredTool({
      name: 'createPage',
      description: 'Create a new page in story dashboard.',
      schema: z.object({
        page: StoryPageSchema
      }),
      func: async ({ page }) => {
        storyService.newStoryPage({
          ...page,
          type: StoryPointType.Canvas,
          gridOptions: {
            gridType: 'fit',
            minCols: MinCols,
            minRows: MinRows
          } as GridsterConfig
          // widgets: widgets.map((item) => schemaToWidget(item, dataSourceName, defaultCube))
        })
        return `The new page be created!`
      }
    }),
    new DynamicStructuredTool({
      name: 'createWidget',
      description: 'Create a widget in story dashboard page.',
      schema: createWidgetSchema({}),
      func: async ({ title, position }) => {
        storyService.createStoryWidget({
          component: WidgetComponentType.AnalyticalCard,
          title,
          position
        })

        return `The new widget be created!`
      }
    })
  ]
}
