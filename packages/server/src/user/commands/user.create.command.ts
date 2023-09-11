import { ICommand } from '@nestjs/cqrs';
import { IUserCreateInput } from '@metad/contracts';

/**
 * EmailVerified automatically
 */
export class UserCreateCommand implements ICommand {
	static readonly type = '[User] Register';

	constructor(public readonly input: IUserCreateInput) {}
}
