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
			description: `Retrieve references docs for a list of questions, such as: how to create a formula for calculated measure, how to create a time slicer for relative time`,
			schema: z.object({
				questions: z.array(z.string().describe('The question used to retrieve references'))
			})
		}
	)
}
