import { IPagination } from '@metad/contracts'
import { Controller, Get, Logger, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, PaginationParams, TransformInterceptor } from '../core'
import { ParseJsonPipe, UseValidationPipe } from '../shared'
import { CopilotOrganization } from './copilot-organization.entity'
import { CopilotOrganizationService } from './copilot-organization.service'

@ApiTags('CopilotOrganization')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotOrganizationController extends CrudController<CopilotOrganization> {
	readonly #logger = new Logger(CopilotOrganizationController.name)
	constructor(
		readonly service: CopilotOrganizationService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$filter', ParseJsonPipe) where: PaginationParams<CopilotOrganization>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<CopilotOrganization>['relations']
	): Promise<IPagination<CopilotOrganization>> {
		return await this.service.findAll({ where, relations })
	}
}
