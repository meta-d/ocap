import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CopilotExampleVectorSeedCommand } from '../vector.seed.command'
import { CopilotExampleService } from '../../copilot-example.service'

@CommandHandler(CopilotExampleVectorSeedCommand)
export class CopilotExampleVectorSeedHandler implements ICommandHandler<CopilotExampleVectorSeedCommand> {
	constructor(
		private readonly exampleService: CopilotExampleService,
	) {}

	public async execute(command: CopilotExampleVectorSeedCommand): Promise<void> {
		const input = command.input

		console.log(`Seed redis command:`, input)
	}
}
