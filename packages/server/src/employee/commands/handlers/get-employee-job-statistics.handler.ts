import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmployeeService } from '../../employee.service';
import { GetEmployeeJobStatisticsCommand } from '../get-employee-job-statistics.command';

@CommandHandler(GetEmployeeJobStatisticsCommand)
export class GetEmployeeJobStatisticsHandler
	implements ICommandHandler<GetEmployeeJobStatisticsCommand> {
	constructor(
		private readonly employeeService: EmployeeService,
	) {}

	public async execute(command: GetEmployeeJobStatisticsCommand) {
		const { request } = command;

		// let { items, total } = await this.employeeService.findAll(request);
		// const employeesStatisticsById = indexBy(
		// 	employeesStatistics,
		// 	'employeeId'
		// );

		// items = items.map((employee) => {
		// 	const employeesStatistic = employeesStatisticsById[employee.id];
		// 	return {
		// 		...employee,
		// 		...employeesStatistic
		// 	};
		// });
		return { };
	}
}
