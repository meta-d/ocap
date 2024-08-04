import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NxStoryService, StoryPreferences } from '@metad/story/core'
import { StoryStyleSchema, WidgetsLayoutSchema } from '@metad/story/story'
import { NGXLogger } from 'ngx-logger'

export function injectModifyStyleTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const modifyStyleTool = new DynamicStructuredTool({
    name: 'modifyStyle',
    description: 'Modify style of the story',
    schema: StoryStyleSchema,
    func: async (style) => {
      logger.debug('[Story] [AI Copilot] [Command tool] [modifyStyle] inputs:', style)
      storyService.mergeStoryPreferences({
        ...style
      } as StoryPreferences)

      return `Story styles have been modified!`
    }
  })

  return modifyStyleTool
}

export function injectLayoutTool() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const layoutTool = new DynamicStructuredTool({
    name: 'layout',
    description: 'Modify layout of current story page',
    schema: WidgetsLayoutSchema,
    func: async ({ widgets }) => {
      logger.debug('[Story] [AI Copilot] [Command tool] [layout] inputs:', widgets)
      widgets.forEach((widget) => {
        storyService.updateWidget({ widgetKey: widget.key, widget: { position: widget.position } })
      })

      return `Story page layout have been modified!`
    }
  })

  return layoutTool
}
