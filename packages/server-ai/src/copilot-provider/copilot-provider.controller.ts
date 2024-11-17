import { IAiProviderEntity, ICopilotProviderModel, ProviderModel } from '@metad/contracts'
import {
	CrudController,
	PaginationParams,
	ParseJsonPipe,
	TransformInterceptor,
	UUIDValidationPipe
} from '@metad/server-core'
import { Body, Controller, ForbiddenException, Get, Param, Post, Put, Delete, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { DeleteResult, UpdateResult } from 'typeorm'
import { ListBuiltinModelsQuery, ListModelProvidersQuery } from '../ai-model'
import { CopilotProvider } from './copilot-provider.entity'
import { CopilotProviderService } from './copilot-provider.service'
import { CopilotProviderDto } from './dto'
import { CopilotProviderModel } from './models/copilot-provider-model.entity'
import { CopilotProviderModelService } from './models/copilot-provider-model.service'

@ApiTags('CopilotProvider')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotProviderController extends CrudController<CopilotProvider> {
	constructor(
		private readonly service: CopilotProviderService,
		private readonly modelService: CopilotProviderModelService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(service)
	}

	@Get(':id')
	async findOneById(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('data', ParseJsonPipe) params?: PaginationParams<CopilotProvider>
	): Promise<CopilotProviderDto> {
		const one = await this.service.findOne(id, params)
		if (one) {
			const providers = await this.queryBus.execute<ListModelProvidersQuery, IAiProviderEntity[]>(
				new ListModelProvidersQuery([one.providerName])
			)
			if (providers[0]) {
				one.provider = providers[0]
			}
		}

		return new CopilotProviderDto(one)
	}

	@Get(':providerId/model')
	async getProviderModels(
		@Param('providerId', UUIDValidationPipe) providerId: string,
	): Promise<{custom: ICopilotProviderModel[]; builtin: ProviderModel[]}> {
		const provider = await this.service.findOne(providerId, { relations: ['models']})
		const models = await this.queryBus.execute(new ListBuiltinModelsQuery(provider.providerName))
		return {
			builtin: models,
			custom: provider.models
		}
	}

	@Post(':providerId/model')
	async createProviderModel(
		@Param('providerId', UUIDValidationPipe) providerId: string,
		@Body() entity?: Partial<ICopilotProviderModel>
	): Promise<CopilotProviderModel> {
		return this.modelService.create({
			...entity,
			providerId
		})
	}

	@Get(':providerId/model/:id')
	async findOneModelById(
		@Param('providerId', UUIDValidationPipe) providerId: string,
		@Param('id', UUIDValidationPipe) id: string,
		@Query('data', ParseJsonPipe) params?: PaginationParams<CopilotProviderModel>
	): Promise<CopilotProviderModel> {
		await this.service.findOne(providerId)
		const model = await this.modelService.findOne(id, params)
		if (model.providerId !== providerId) {
			throw new ForbiddenException(`Provider model not match`)
		}
		return model
	}

	@Put(':providerId/model/:id')
	async updateProviderModel(
		@Param('providerId', UUIDValidationPipe) providerId: string,
		@Param('id', UUIDValidationPipe) id: string,
		@Body() entity?: Partial<ICopilotProviderModel>
	): Promise<CopilotProviderModel | UpdateResult> {
		return this.modelService.update(id, {
			...entity,
			providerId
		})
	}

	@Delete(':providerId/model/:id')
	async deleteProviderModel(
		@Param('providerId', UUIDValidationPipe) providerId: string,
		@Param('id', UUIDValidationPipe) id: string,
	): Promise<DeleteResult> {
		return this.modelService.delete(id)
	}
}
