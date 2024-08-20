import { tool } from '@langchain/core/tools'
import { Logger } from '@nestjs/common'
import { formatDocumentsAsString } from 'langchain/util/document'
import { z } from 'zod'
import { CopilotKnowledgeService } from './copilot-knowledge.service'
import { CopilotKnowledgeRetriever, CopilotKnowledgeRetrieverOptions } from './retriever'

export function createReferencesRetrieverTool(
	service: CopilotKnowledgeService,
	options: CopilotKnowledgeRetrieverOptions
) {
	const logger = new Logger('ReferencesRetrieverTool')
	const knowledgeRetriever = new CopilotKnowledgeRetriever(service, options)

	return tool(
		async ({ questions }) => {
			logger.debug(`[Copilot Tool][References Retriever] Retrieving references for ${questions}`)
			return knowledgeRetriever.pipe(formatDocumentsAsString).invoke(questions.join('\n'))
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
