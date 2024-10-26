import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Xpert } from '../../xpert.entity'
import { XpertService } from '../../xpert.service'
import { XpertExecuteCommand } from '../execute.command'

@CommandHandler(XpertExecuteCommand)
export class XpertExecuteHandler implements ICommandHandler<XpertExecuteCommand> {
	readonly #logger = new Logger(XpertExecuteHandler.name)

	constructor(private readonly xpertService: XpertService) {}

	public async execute(command: XpertExecuteCommand): Promise<Xpert> {

		console.log(command.xpert, command.input)

		return null
	}
}
