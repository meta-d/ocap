import { inject } from '@angular/core'
import { tool } from '@langchain/core/tools'
import { ExampleVectorStoreRetrieverInput } from '@metad/copilot-angular'
import { formatDocumentsAsString } from 'langchain/util/document'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { injectExampleRetriever } from './references'

export function injectReferencesRetrieverTool(command: string | string[], options?: { k: number }) {
  const logger = inject(NGXLogger)
  const exampleRetriever = injectExampleRetriever(command, options as ExampleVectorStoreRetrieverInput)
  return tool(
    async ({ questions }) => {
      logger.debug(`[Copilot Tool][References Retriever] Retrieving references for ${questions}`)
      return exampleRetriever.pipe(formatDocumentsAsString).invoke(questions.join('\n'))
    },
    {
      name: 'referencesRetriever',
      description: 'Retrieve references for a list of questions',
      schema: z.object({
        questions: z.array(z.string().describe('The question to retrieve references'))
      })
    }
  )
}
