import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
}
