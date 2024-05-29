import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CopilotRole } from '../../copilot-role.entity'
import { CopilotRoleService } from '../../copilot-role.service'
import { CopilotRoleCreateCommand } from '../create.command'

@CommandHandler(CopilotRoleCreateCommand)
export class CopilotRoleCreateHandler implements ICommandHandler<CopilotRoleCreateCommand> {
	readonly #logger = new Logger(CopilotRoleCreateHandler.name)

	constructor(private readonly roleService: CopilotRoleService) {}

	public async execute(command: CopilotRoleCreateCommand): Promise<CopilotRole> {
		const entity = command.input
		const result = await this.roleService.findOneOrFail({ where: { name: entity.name } })
		if (result.success) {
			throw new Error(`Role with name ${entity.name} already exists`)
		}

		return await this.roleService.create(entity)
	}
}
