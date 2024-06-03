import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { groupBy } from 'lodash'
import { vectorColor } from '../../../core/utils'
import { CopilotExampleService } from '../../copilot-example.service'
import { CopilotExampleVectorSeedCommand } from '../vector.seed.command'

@CommandHandler(CopilotExampleVectorSeedCommand)
export class CopilotExampleVectorSeedHandler implements ICommandHandler<CopilotExampleVectorSeedCommand> {
	readonly #logger = new Logger(CopilotExampleVectorSeedHandler.name)

	constructor(private readonly exampleService: CopilotExampleService) {}

	public async execute(command: CopilotExampleVectorSeedCommand): Promise<void> {
		const input = command.input
		const { tenantId, refresh } = input

		const examples = await this.exampleService.findAll({ where: { tenantId } })
		if (examples.items.length) {
			this.#logger.debug(vectorColor(`Seeding Redis vectors with copilot examples for tenant ${tenantId}`))
			const roles = groupBy(examples.items, 'role')
			for (const role in roles) {
				const roleExamples = roles[role]
				const vectorStore = await this.exampleService.getVectorStore(tenantId, role === 'null' ? null : role)
				if (roleExamples.length && vectorStore) {
					// console.log(vectorStore.vectorStore.indexName, `examples count: ${roleExamples.length}`)
					if (await vectorStore.checkIndexExists()) {
						if (refresh) {
							await vectorStore.clear()
							await vectorStore.addExamples(roleExamples)
						}
					} else {
						await vectorStore.addExamples(roleExamples)
					}
				}
			}
		}
	}
}
