import { inject } from "@angular/core"
import { NxStoryService } from "@metad/story/core"
import { NGXLogger } from "ngx-logger"

export function injectStoryWidgetCommand(storyService: NxStoryService) {
    const logger = inject(NGXLogger)
  
    let dataSourceName: string | null = null
    let defaultCube: EntityType | null = null

}