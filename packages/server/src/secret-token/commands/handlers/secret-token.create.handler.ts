import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecretTokenCreateCommand } from '../secret-token.create.command';
import { SecretTokenService } from '../../secret-token.service';

@CommandHandler(SecretTokenCreateCommand)
export class SecretTokenCreateHandler
	implements ICommandHandler<SecretTokenCreateCommand> {
	
	constructor(
		private readonly _stService : SecretTokenService
	) {}

	public async execute(
		command: SecretTokenCreateCommand
	) {
		const { input } = command;
		const { entityId, token, validUntil } = input;

		try {
			return await this._stService.create({
				entityId,
				token,
				validUntil
			});
		} catch (error) {
			//
		}
	}
}
