import { Signal, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { Property } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { injectDimensionModeler } from './graph'
import { DimensionCommandName } from './types'

export function injectDimensionCommand(dimensions: Signal<Property[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const createDimensionModeler = injectDimensionModeler()

  const fewShotPrompt = injectAgentFewShotTemplate(DimensionCommandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(DimensionCommandName, {
    alias: 'd',
    description: translate.instant('PAC.MODEL.Copilot.CommandDimensionDesc', {
      Default: 'Descripe business logic of the dimension'
    }),
    historyCursor: () => {
      return modelService.getHistoryCursor()
    },
    revert: async (index: number) => {
      modelService.gotoHistoryCursor(index)
    },
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true
    },
    fewShotPrompt,
    createGraph: createDimensionModeler
  })
}
