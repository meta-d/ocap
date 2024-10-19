import { Injectable } from '@nestjs/common'
import { AIModel } from '../../../ai-model'
import { ModelProvider } from '../../../ai-provider'
import { AIModelEntity } from '../../../entities'
import { ModelType } from '@metad/contracts'

@Injectable()
export class OpenAILargeLanguageModel extends AIModel {

	constructor(
		readonly modelProvider: ModelProvider,
	) {
		super(modelProvider, ModelType.LLM)
	}

	validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
		throw new Error('Method not implemented.')
	}
	protected getCustomizableModelSchemaFromCredentials(
		model: string,
		credentials: Record<string, any>
	): Promise<AIModelEntity | null> {
		throw new Error('Method not implemented.')
	}
}
