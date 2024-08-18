import { ChatPromptTemplate } from '@langchain/core/prompts'

import { inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NgmCopilotService } from '@metad/copilot-angular'
import { nonNullable } from '@metad/ocap-core'
import { filter, switchMap } from 'rxjs/operators'
import z from 'zod'

export function injectExamplesAgent() {
  const copilotService = inject(NgmCopilotService)
  const role = copilotService.rolePrompt
  const language = copilotService.languagePrompt

  return toSignal(
    copilotService.llm$.pipe(
      filter(nonNullable),
      switchMap(async (model) => {
        const prompt = ChatPromptTemplate.fromMessages(
          [
            [
              'system',
              `You are a professional BI data analyst.
{{role}}
{{language}}
The cube context is:
{{context}}

Give some example prompts for analysis the data cube.
`
            ],
            ['user', '{{input}}']
          ],
          { templateFormat: 'mustache' }
        )

        const llmWithStructuredOutput = model.withStructuredOutput(
          z.object({
            examples: z.array(z.string().describe('example prompt for data analysis'))
          })
        )

        const chain = prompt.pipe(llmWithStructuredOutput)

        return {
          invoke: (state: { input: string; context?: string }) =>
            chain.invoke({ ...state, role: role(), language: language() })
        }
      })
    )
  )
}
