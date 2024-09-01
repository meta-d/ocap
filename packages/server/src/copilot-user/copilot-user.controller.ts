import { ICopilotUser, IPagination, RolesEnum } from '@metad/contracts'
import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, PaginationParams, TransformInterceptor } from '../core'
import { ParseJsonPipe, RoleGuard, Roles, UseValidationPipe } from '../shared'
import { CopilotUser } from './copilot-user.entity'
import { CopilotUserService } from './copilot-user.service'

@ApiTags('CopilotUser')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotUserController extends CrudController<CopilotUser> {
	readonly #logger = new Logger(CopilotUserController.name)
	constructor(
		readonly service: CopilotUserService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.TRIAL)
	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$filter', ParseJsonPipe) where: PaginationParams<CopilotUser>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<CopilotUser>['relations']
	): Promise<IPagination<CopilotUser>> {
		return await this.service.findAll({ where, relations })
	}

	@UseGuards(RoleGuard)
	@Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.TRIAL)
	@Post(':id/renew')
	async renew(@Param('id') id: string, @Body() entity: Partial<ICopilotUser>) {
		return await this.service.renew(id, entity)
	}
}
