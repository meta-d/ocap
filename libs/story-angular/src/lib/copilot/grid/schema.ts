import { CopilotDefaultOptions } from '@metad/copilot'
import { AnalyticsAnnotation, EntityType } from '@metad/ocap-core'
import { fixDimension } from '@metad/story/core'
import { GridWidgetSchema } from '@metad/story/story'
import zodToJsonSchema from 'zod-to-json-schema'

export const editWidgetGrid = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'edit-story-widget-grid',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(GridWidgetSchema)
    }
  ],
  function_call: { name: 'edit-story-widget-grid' }
}

export function analyticsAnnotationCheck(analytics: AnalyticsAnnotation, entityType: EntityType) {
  if (!analytics) {
    return analytics
  }

  return {
    ...analytics,
    rows: analytics.rows?.map((item) => fixDimension(item, entityType)),
    columns: analytics.columns?.map((item) => fixDimension(item, entityType))
  }
}
