import { inject, Provider } from '@angular/core'
import { SemanticSimilarityExampleSelector } from '@langchain/core/example_selectors'
import { FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { ExampleVectorStoreRetrieverInput, NgmCommandFewShotPromptToken, NgmCopilotService } from '@metad/copilot-angular'
import { CopilotExampleService } from '../services/copilot-example.service'
import { ExampleVectorStoreRetriever } from './example-vector-retriever'

export function injectAgentFewShotTemplate(command: string, fields?: ExampleVectorStoreRetrieverInput) {
  const copilotService = inject(NgmCopilotService)
  const copilotExampleService = inject(CopilotExampleService)

  return createExampleFewShotPrompt(copilotService, copilotExampleService, command, fields)
}

function createExampleFewShotPrompt(
  copilotService: NgmCopilotService,
  copilotExampleService: CopilotExampleService,
  command: string,
  fields?: ExampleVectorStoreRetrieverInput
) {
  const examplePrompt = PromptTemplate.fromTemplate(
    `Question: {{input}}
    Answer: {{output}}`,
    {
      templateFormat: 'mustache'
    }
  )
  return new FewShotPromptTemplate({
    exampleSelector: new SemanticSimilarityExampleSelector({
      vectorStoreRetriever: new ExampleVectorStoreRetriever(
        {
          ...(fields ?? { vectorStore: null }),
          vectorStore: null,
          command,
          role: copilotService.role
        },
        copilotExampleService
      ),
      inputKeys: ['input']
    }),
    examplePrompt,
    prefix: `Refer to the examples below to provide solutions to the problem.`,
    suffix: 'Question: {{input}}\n\nAnswer: ',
    inputVariables: ['input'],
    templateFormat: 'mustache'
  })
}

export function provideCommandFewShotPrompt() {
  return [
    {
      provide: NgmCommandFewShotPromptToken,
      useFactory: (copilotService: NgmCopilotService, copilotExampleService: CopilotExampleService) => {
        return (commandName: string, fields: ExampleVectorStoreRetrieverInput) => {
          return createExampleFewShotPrompt(copilotService, copilotExampleService, commandName, fields)
        }
      },
      deps: [NgmCopilotService, CopilotExampleService]
    } as Provider
  ]
}
