import { ICopilot, ICopilotModel } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

/**
 * @deprecated use `CopilotModelGetChatModelQuery`
 * 
 * Get a AI Model and check it's token limitation, record the token usage
 */
export class AIModelGetOneQuery implements IQuery {
	static readonly type = '[AI Model] Get One'

	constructor(
		public readonly copilot: ICopilot,
		public readonly copilotModel: ICopilotModel,
		public readonly options: {
			modelProperties: Record<string, any>;
			abortController?: AbortController;
			tokenCallback?: (tokens: number) => void
		}
	) {}
}
