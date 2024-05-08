import { inject } from '@angular/core'
import { zodToProperties } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { CalculationMeasureSchema } from './schema/story.schema'
import { DataSettings } from '@metad/ocap-core'

export function injectCalclatedMeasureCommand(
  dataSettings: DataSettings,
  storyService: NxStoryService,
  callback: (calculation: any) => Promise<void>
) {
  const logger = inject(NGXLogger)

  return injectCopilotCommand({
    name: 'calc',
    description: storyService.translate('Story.Copilot.CalculatedMeasureCommandDesc', {
      Default: 'Describe the calculated measure you want'
    }),
    systemPrompt: async () => {
      return `Create a calculatation measure`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create_calculation_measure',
        description: '',
        argumentAnnotations: [
          {
            name: 'calculatedMeasure',
            type: 'object',
            description: 'The calculated measure',
            properties: zodToProperties(CalculationMeasureSchema),
            required: true
          }
        ],
        implementation: async (calculation) => {
          logger.debug(`Function calling 'create_calculation_measure', params is:`, calculation)

          storyService.addCalculationMeasure({ dataSettings, calculation })

          if (callback) {
            await callback(calculation)
          }

          return `✅ ${storyService.translate('Story.Copilot.InstructionExecutionComplete', {
            Default: 'Instruction Execution Complete'
          })}`
        }
      })
    ]
  })
}
