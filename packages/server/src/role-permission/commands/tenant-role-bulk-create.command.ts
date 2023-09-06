import { ICommand } from '@nestjs/cqrs';
import { ITenant } from '@metad/contracts';

export class TenantRolePermissionBulkCreateCommand implements ICommand {
	static readonly type = '[RolePermission] Bulk Create';

	constructor(public readonly input: ITenant[]) {}
}
