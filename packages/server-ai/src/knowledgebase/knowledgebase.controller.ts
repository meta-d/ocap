import { Metadata } from '@metad/contracts'
import { Body, Controller, Logger, Param, Post, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Knowledgebase } from './knowledgebase.entity'
import { KnowledgebaseService } from './knowledgebase.service'

@ApiTags('Knowledgebase')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class KnowledgebaseController extends CrudController<Knowledgebase> {
	readonly #logger = new Logger(KnowledgebaseController.name)
	constructor(
		private readonly service: KnowledgebaseService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Post(':id/test')
	async test(@Param('id') id: string, @Body() body: { query: string; k: number; score: number; filter: Metadata }) {
		return this.service.test(id, body)
	}
}
