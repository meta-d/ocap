import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmployeeService } from '../../employee.service';
import { UpdateEmployeeJobSearchStatusCommand } from '../update-employee-job-search-status.command';

@CommandHandler(UpdateEmployeeJobSearchStatusCommand)
export class UpdateEmployeeJobSearchStatusHandler
	implements ICommandHandler<UpdateEmployeeJobSearchStatusCommand> {
	constructor(
		private readonly employeeService: EmployeeService,
	) {}

	public async execute(command: UpdateEmployeeJobSearchStatusCommand) {
		const { employeeId, request } = command;

		return this.employeeService.update(employeeId, request);
	}
}
