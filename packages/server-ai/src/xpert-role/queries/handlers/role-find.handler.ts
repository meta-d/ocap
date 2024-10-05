import { IXpertRole } from '@metad/contracts'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { XpertRoleService } from '../../xpert-role.service'
import { FindXpertRoleQuery } from '../role-find.query'

@QueryHandler(FindXpertRoleQuery)
export class FindXpertRoleHandler implements IQueryHandler<FindXpertRoleQuery> {
	constructor(private readonly service: XpertRoleService) {}

	public async execute(command: FindXpertRoleQuery): Promise<IXpertRole> {
		return await this.service.findOne({ where: command.input })
	}
}
