import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SemanticModelEntity } from '../../entity.entity'
import { SemanticModelEntityService } from '../../entity.service'
import { ModelEntityUpdateCommand } from '../entity.update.command'

@CommandHandler(ModelEntityUpdateCommand)
export class ModelEntityUpdateHandler implements ICommandHandler<ModelEntityUpdateCommand> {
	constructor(private readonly entityService: SemanticModelEntityService) {}

	public async execute(command: ModelEntityUpdateCommand): Promise<SemanticModelEntity> {
		const { input } = command
		const { id } = input

		await this.entityService.update(id, input)
		return this.entityService.findOne(id)
	}
}
