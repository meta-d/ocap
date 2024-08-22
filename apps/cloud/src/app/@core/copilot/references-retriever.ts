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
      description: `Retrieve references docs for a list of questions, such as: how to create a formula for calculated measure, how to create a time slicer for relative time`,
      schema: z.object({
        questions: z.array(z.string().describe('The question to retrieve references'))
      })
    }
  )
}
