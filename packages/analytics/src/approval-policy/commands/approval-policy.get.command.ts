import { IApprovalPolicy } from '@metad/contracts';
import { PaginationParams } from '@metad/server-core';
import { ICommand } from '@nestjs/cqrs';

export class ApprovalPolicyGetCommand implements ICommand {
	static readonly type = '[Approval Policy] Get';

	constructor(
		public readonly input: PaginationParams<IApprovalPolicy>
	) {}
}
