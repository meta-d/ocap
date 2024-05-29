import { inject } from '@angular/core'
import { SemanticSimilarityExampleSelector } from '@langchain/core/example_selectors'
import { VectorStoreRetrieverInput, VectorStoreInterface } from '@langchain/core/vectorstores'
import { FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { CopilotExampleService } from '../services/copilot-example.service'
import { VectorStoreRetriever } from './example-vector-retriever'

export function injectAgentFewShotTemplate(command: string, fields?: VectorStoreRetrieverInput<VectorStoreInterface>) {
  const copilotService = inject(NgmCopilotService)
  const copilotExampleService = inject(CopilotExampleService)

  const examplePrompt = PromptTemplate.fromTemplate(`Question: {input}
Answer: {output}`)

  return new FewShotPromptTemplate({
    exampleSelector: new SemanticSimilarityExampleSelector({
      vectorStoreRetriever: new VectorStoreRetriever(
        {
          ...(fields ?? {}),
          vectorStore: null,
          command,
          role: copilotService.role,
        },
        copilotExampleService
      ),
      inputKeys: ['input']
    }),
    examplePrompt,
    prefix: `Refer to the examples below to provide solutions to the problem.`,
    suffix: 'Question: {{input}}\nAnswer: ',
    inputVariables: ['input'],
    templateFormat: "mustache",
  })
}
