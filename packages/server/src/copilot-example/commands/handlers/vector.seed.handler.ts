import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { groupBy } from 'lodash'
import { vectorColor } from '../../../core/utils'
import { CopilotExampleService } from '../../copilot-example.service'
import { CopilotExampleVectorSeedCommand } from '../vector.seed.command'

@CommandHandler(CopilotExampleVectorSeedCommand)
export class CopilotExampleVectorSeedHandler implements ICommandHandler<CopilotExampleVectorSeedCommand> {
	readonly #logger = new Logger(CopilotExampleVectorSeedHandler.name)

	constructor(
		private readonly exampleService: CopilotExampleService,
	) { }

	public async execute(command: CopilotExampleVectorSeedCommand): Promise<void> {
		const input = command.input
		const { tenantId, refresh } = input

		const examples = await this.exampleService.findAll({ where: { tenantId } })
		if (examples.items.length) {
			this.#logger.debug(vectorColor(`Seeding Redis vectors with copilot examples for tenant ${tenantId}`))
			const roles = groupBy(examples.items, 'role')
			for (const role in roles) {
				const roleExamples = roles[role]
				const commands = groupBy(roleExamples, 'command')
				for (const command in commands) {
					const commandExamples = commands[command].filter((example) => example.vector)
					const vectorStore = await this.exampleService.getVectorStore(tenantId, role === 'null' ? null : role, command === 'null' ? null : command)
					if (commandExamples.length && vectorStore) {
						console.log(vectorStore.vectorStore.indexName)
						if (vectorStore.checkIndexExists()) {
							if (refresh) {
								await vectorStore.clear()
								await vectorStore.addExamples(commandExamples)
							}
						} else {
							await vectorStore.addExamples(commandExamples)
						}
					}
				}
			}
		}
	}
}
