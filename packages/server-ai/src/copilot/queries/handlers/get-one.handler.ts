import { ICopilot } from '@metad/contracts'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CopilotService } from '../../copilot.service'
import { CopilotGetOneQuery } from '../get-one.query'

@QueryHandler(CopilotGetOneQuery)
export class CopilotGetOneHandler implements IQueryHandler<CopilotGetOneQuery> {
	constructor(private readonly service: CopilotService) {}

	public async execute(command: CopilotGetOneQuery): Promise<ICopilot> {
		return await this.service.findOne(command.id)
	}
}
