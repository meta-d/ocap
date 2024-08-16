import { ICommand } from '@nestjs/cqrs'

export class UserSessionCommand implements ICommand {
	static readonly type = '[ChatBI] User Session'

	constructor(
		public readonly input: {
			tenantId: string
			organizationId: string
			userId: string
			modelId: string
			cubeName: string
		}
	) {}
}
