import { inject } from '@angular/core'
import { ExampleVectorStoreRetrieverInput, NgmCopilotService } from '@metad/copilot-angular'
import { CopilotExampleService } from '../services/copilot-example.service'
import { ExampleVectorStoreRetriever } from './example-vector-retriever'

export function injectExampleRetriever(command: string | string[], fields?: ExampleVectorStoreRetrieverInput) {
  const copilotService = inject(NgmCopilotService)
  const copilotExampleService = inject(CopilotExampleService)

  return new ExampleVectorStoreRetriever(
    {
      ...(fields ?? { vectorStore: null }),
      vectorStore: null,
      command,
      role: copilotService.role
    },
    copilotExampleService
  )
}
