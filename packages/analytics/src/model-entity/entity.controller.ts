import { IPagination } from '@metad/contracts'
import {
	CrudController,
	PaginationParams,
	UUIDValidationPipe
} from '@metad/server-core'
import {
	Body,
	Controller,
	Get,
	Param,
	Post
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SemanticModelEntity } from './entity.entity'
import { SemanticModelEntityService } from './entity.service'

@ApiTags('SemanticModelEntity')
@ApiBearerAuth()
@Controller()
export class ModelEntityController extends CrudController<SemanticModelEntity> {
	constructor(private readonly entityService: SemanticModelEntityService) {
		super(entityService)
	}

	@Get(':id')
	getAllByModel(
		@Param('id') id: string,
		filter?: PaginationParams<SemanticModelEntity>,
		...options: any[]
	): Promise<IPagination<SemanticModelEntity>> {
		return this.entityService.findAll({ where: { modelId: id } })
	}

	@Post(':id')
	createByModel(
		@Param('id', UUIDValidationPipe) id: string,
		@Body() entity: SemanticModelEntity
	): Promise<SemanticModelEntity> {
		entity.modelId = id
		return this.entityService.create(entity)
	}
}
