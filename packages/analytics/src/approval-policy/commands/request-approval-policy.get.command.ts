import { IListQueryInput, IPermissionApprovalFindInput } from '@metad/contracts';
import { ICommand } from '@nestjs/cqrs';

export class PermissionApprovalPolicyGetCommand implements ICommand {
	static readonly type = '[PermissionApprovalPolicy] Get';

	constructor(
		public readonly input: IListQueryInput<IPermissionApprovalFindInput>
	) {}
}
