import { SemanticSimilarityExampleSelector } from '@langchain/core/example_selectors'
import { FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { CopilotKnowledgeService } from './copilot-knowledge.service'
import { CopilotKnowledgeRetrieverOptions, createCopilotKnowledgeRetriever } from './retriever'

export function createExampleFewShotPrompt(
	service: CopilotKnowledgeService,
	options: CopilotKnowledgeRetrieverOptions
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
			vectorStoreRetriever: createCopilotKnowledgeRetriever(service, options),
			inputKeys: ['input']
		}),
		examplePrompt,
		prefix: `Refer to the examples below to provide solutions to the problem.`,
		suffix: 'Question: {{input}}\n\nAnswer: ',
		inputVariables: ['input'],
		templateFormat: 'mustache'
	})
}
