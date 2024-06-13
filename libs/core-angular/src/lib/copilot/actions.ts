import { inject } from '@angular/core'
import { injectMakeCopilotActionable } from '@metad/copilot-angular'
import { EntityType } from '@metad/ocap-core'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { calcEntityTypePrompt } from './utils'

export function injectPickDefaultCubeAction(
  openDefultDataSettings: () => Promise<{ dataSource: string; entityType: EntityType }>
) {
  const logger = inject(NGXLogger)

  return injectMakeCopilotActionable({
    name: 'pick_default_cube',
    description: 'Pick a default cube',
    argumentAnnotations: [],
    implementation: async () => {
      const result = await openDefultDataSettings()
      logger.debug(`Pick the default cube is:`, result)
      if (result?.dataSource && result?.entityType) {
        return {
          id: nanoid(),
          role: 'function',
          content: `The cube is:
\`\`\`
${calcEntityTypePrompt(result?.entityType)}
\`\`\`
`
        }
      }

      throw new Error('No cube is picked')
    }
  })
}
