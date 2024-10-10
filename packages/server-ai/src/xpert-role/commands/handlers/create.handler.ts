import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { XpertRole } from '../../xpert-role.entity'
import { XpertRoleService } from '../../xpert-role.service'
import { XpertRoleCreateCommand } from '../create.command'

@CommandHandler(XpertRoleCreateCommand)
export class XpertRoleCreateHandler implements ICommandHandler<XpertRoleCreateCommand> {
	readonly #logger = new Logger(XpertRoleCreateHandler.name)

	constructor(private readonly roleService: XpertRoleService) {}

	public async execute(command: XpertRoleCreateCommand): Promise<XpertRole> {
		const entity = command.input
		const result = await this.roleService.findOneOrFail({ where: { name: entity.name } })
		if (result.success) {
			throw new Error(`Role with name ${entity.name} already exists`)
		}

		return await this.roleService.create(entity)
	}
}

