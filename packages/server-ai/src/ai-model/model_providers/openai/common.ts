import { ClientOptions, OpenAIBaseInput } from '@langchain/openai'
import { AIModel } from '../../ai-model'
import { OpenAICredentials } from './types'

export abstract class CommonOpenAI extends AIModel {
	protected toCredentialKwargs(credentials: OpenAICredentials): OpenAIBaseInput & { configuration: ClientOptions } {
		const credentialsKwargs: OpenAIBaseInput = {
			apiKey: credentials.openai_api_key
		} as OpenAIBaseInput
		const configuration: ClientOptions = {}

		if (credentials.openai_api_base) {
			const openaiApiBase = credentials.openai_api_base.replace(/\/$/, '')
			configuration.baseURL = `${openaiApiBase}/v1`
		}

		if (credentials.openai_organization) {
			configuration.organization = credentials.openai_organization
		}

		return {
			...credentialsKwargs,
			configuration
		}
	}
}
