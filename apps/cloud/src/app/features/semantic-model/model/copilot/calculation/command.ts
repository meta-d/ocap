import { Signal, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { CalculatedMember } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { injectCreateCalculatedMeasure, injectEditFormulaAgent } from './graph'

export function injectCalculatedCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createCalculatedMeasure = injectCreateCalculatedMeasure()

  const commandName = 'calculated'
  return injectCopilotCommand(commandName, {
    alias: 'calc',
    description: translate.instant('PAC.MODEL.Copilot.CommandCalculatedDesc', {
      Default: 'Descripe business logic of the calculated measure'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true
    },
    createGraph: createCalculatedMeasure
  })
}

export function injectFormulaCommand(calculatedMember: Signal<CalculatedMember>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createEditFormulaAgent = injectEditFormulaAgent(calculatedMember)

  const commandName = 'formula'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(commandName, {
    alias: 'f',
    description: translate.instant('PAC.MODEL.Copilot.CommandFormulaDesc', {
      Default: 'Descripe business logic of the formula of calculated measure'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true
    },
    fewShotPrompt,
    createGraph: createEditFormulaAgent
  })
}
