import { IPagination } from '@metad/contracts'
import { CrudController, PaginationParams, ParseJsonPipe, UseValidationPipe } from '@metad/server-core'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ChatBIModel } from './chatbi-model.entity'
import { ChatBIModelService } from './chatbi-model.service'

@ApiTags('ChatBIModel')
@ApiBearerAuth()
@Controller()
export class ChatBIModelController extends CrudController<ChatBIModel> {
	constructor(private readonly service: ChatBIModelService) {
		super(service)
	}

	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$filter', ParseJsonPipe) where: PaginationParams<ChatBIModel>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<ChatBIModel>['relations'],
		@Query('$order', ParseJsonPipe) order: PaginationParams<ChatBIModel>['order']
	): Promise<IPagination<ChatBIModel>> {
		return await this.service.findAll({ where, relations, order })
	}
}
