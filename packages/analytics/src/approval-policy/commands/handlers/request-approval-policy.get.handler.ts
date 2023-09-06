import { IApprovalPolicy, IPagination } from '@metad/contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApprovalPolicyService } from '../../approval-policy.service';
import { PermissionApprovalPolicyGetCommand } from '../request-approval-policy.get.command';

@CommandHandler(PermissionApprovalPolicyGetCommand)
export class PermissionApprovalPolicyGetHandler
	implements ICommandHandler<PermissionApprovalPolicyGetCommand> {
	constructor(
		private readonly approvalPolicyService: ApprovalPolicyService
	) {}

	public async execute(
		command: PermissionApprovalPolicyGetCommand
	): Promise<IPagination<IApprovalPolicy>> {
		const { input } = command;
		return this.approvalPolicyService.findApprovalPoliciesForPermissionApproval(
			input
		);
	}
}
