import { ICommand } from '@nestjs/cqrs';
import { IOrganizationContactInviteInput } from '@metad/contracts';

export class InviteOrganizationContactCommand implements ICommand {
	static readonly type = '[OrganizationContact] Invite';

	constructor(public readonly input: IOrganizationContactInviteInput) {}
}
