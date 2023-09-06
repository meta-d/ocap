import { ICommand } from '@nestjs/cqrs';

export class PermissionApprovalStatusCommand implements ICommand {
	static readonly type = '[PermissionApproval] Status';

	constructor(
		public readonly permissionApprovalId: string,
		public readonly status: number
	) {}
}
