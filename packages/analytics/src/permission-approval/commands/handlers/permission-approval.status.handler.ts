import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { PermissionApprovalStatusCommand } from '../permission-approval.status.command';
import { PermissionApprovalService } from '../../permission-approval.service';
import { PermissionApproval } from '../../permission-approval.entity';

@CommandHandler(PermissionApprovalStatusCommand)
export class PermissionApprovalStatusHandler
	implements ICommandHandler<PermissionApprovalStatusCommand> {
	constructor(
		private permissionApprovalService: PermissionApprovalService,
	) {}

	public async execute(
		command?: PermissionApprovalStatusCommand
	): Promise<PermissionApproval> {
		const { permissionApprovalId, status } = command;

		const approval = await this.permissionApprovalService.updateStatusApprovalByAdmin(permissionApprovalId, status)


		return approval;
	}
}
