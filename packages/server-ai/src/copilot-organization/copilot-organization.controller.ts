import { ICopilotOrganization, IPagination, RolesEnum } from '@metad/contracts'
import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { TransformInterceptor, CrudController, PaginationParams, ParseJsonPipe, RoleGuard, Roles, UseValidationPipe } from '@metad/server-core'
import { CopilotOrganization } from './copilot-organization.entity'
import { CopilotOrganizationService } from './copilot-organization.service'

@ApiTags('CopilotOrganization')
@UseInterceptors(TransformInterceptor)
@UseGuards(RoleGuard) // 目前没有起作用 （RoleGuard on controller scope）只能放在方法上
@Roles(RolesEnum.SUPER_ADMIN)
@Controller()
export class CopilotOrganizationController extends CrudController<CopilotOrganization> {
	readonly #logger = new Logger(CopilotOrganizationController.name)
	constructor(
		readonly service: CopilotOrganizationService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.SUPER_ADMIN)
	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$filter', ParseJsonPipe) where: PaginationParams<CopilotOrganization>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<CopilotOrganization>['relations']
	): Promise<IPagination<CopilotOrganization>> {
		return await this.service.findAll({ where, relations })
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.SUPER_ADMIN)
	@Post(':id/renew')
	async renew(@Param('id') id: string, @Body() entity: Partial<ICopilotOrganization>) {
		return await this.service.renew(id, entity)
	}
}
