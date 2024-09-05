import { ICopilotRole } from '@metad/contracts'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CopilotRoleService } from '../../copilot-role.service'
import { FindCopilotRoleQuery } from '../role-find.query'

@QueryHandler(FindCopilotRoleQuery)
export class FindCopilotRoleHandler implements IQueryHandler<FindCopilotRoleQuery> {
	constructor(private readonly service: CopilotRoleService) {}

	public async execute(command: FindCopilotRoleQuery): Promise<ICopilotRole> {
		return await this.service.findOne({ where: command.input })
	}
}
