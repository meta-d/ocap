import { IChatBIModel } from '@metad/contracts'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ChatBIService } from '../../chatbi.service'
import { UserSessionCommand } from '../user-session.command'

@CommandHandler(UserSessionCommand)
export class UserSessionHandler implements ICommandHandler<UserSessionCommand> {
	constructor(private readonly chatBIService: ChatBIService) {}

	public async execute(command: UserSessionCommand): Promise<IChatBIModel> {
		const { input } = command
		return await this.chatBIService.upsertUserSession(input.userId, {
			tenantId: input.tenantId,
			organizationId: input.organizationId,
			chatModelId: input.chatModelId
		})
	}
}
