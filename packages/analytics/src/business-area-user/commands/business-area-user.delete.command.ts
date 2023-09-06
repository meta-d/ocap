import { ICommand } from '@nestjs/cqrs';
import { IBusinessAreaUserDeleteInput } from '@metad/contracts';

export class BusinessAreaUserDeleteCommand implements ICommand {
	static readonly type = '[Business Area User] Delete';

	constructor(public readonly input: IBusinessAreaUserDeleteInput) {}
}
