import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { BusinessAreaAwareCrudService } from '../core/crud/index'
import { SemanticModelEntity } from './entity.entity'

@Injectable()
export class SemanticModelEntityService extends BusinessAreaAwareCrudService<SemanticModelEntity> {
	private readonly logger = new Logger(SemanticModelEntityService.name)

	constructor(
		@InjectRepository(SemanticModelEntity)
		entityRepository: Repository<SemanticModelEntity>,
		readonly commandBus: CommandBus,
	) {
		super(entityRepository, commandBus)
	}

	public async create(entity: DeepPartial<SemanticModelEntity>, ...options: any[]): Promise<SemanticModelEntity> {
		const _entity = await this.findOneOrFail({ where: {
			modelId: entity.modelId,
			name: entity.name
		} })

		if (_entity.success) {
			await this.update(_entity.record.id, entity)
			return this.findOne(_entity.record.id)
		} else {
			return await super.create(entity)
		}
	}
}
