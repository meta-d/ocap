import { TXpertRoleDraft } from '@metad/contracts'
import { CrudController, ParseJsonPipe, RequestContext, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, Get, Logger, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { XpertRole } from './xpert-role.entity'
import { XpertRoleService } from './xpert-role.service'
import { XpertRolePublicDTO } from './dto'

@ApiTags('XpertRole')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertRoleController extends CrudController<XpertRole> {
	readonly #logger = new Logger(XpertRoleController.name)
	constructor(
		private readonly service: XpertRoleService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Get('by-workspace/:id')
	async getAllByWorkspace(@Param('id') workspaceId: string, @Query('data', ParseJsonPipe) data: any) {
		return this.service.getAllByWorkspace(workspaceId, data, RequestContext.currentUser())
	}
	@Get('validate')
	async validateTitle(@Query('title') title: string) {
		return this.service.validateTitle(title).then((items) => items.map((item) => new XpertRolePublicDTO(item)))
	}

	@Get(':id/team')
	async getTeam(@Param('id') id: string) {
		return this.service.getTeam(id)
	}

	@Get(':id/version')
	async allVersions(@Param('id') id: string) {
		return this.service.allVersions(id)
	}

	@Put(':id/draft')
	async saveDraft(@Param('id') roleId: string, @Body() body: TXpertRoleDraft) {
		// todo 检查有权限编辑此 xpert role

		// Save draft
		await this.service.saveDraft(roleId, body)
	}

	@Post(':id/publish')
	async publish(@Param('id') id: string,) {
		return await this.service.publish(id)
	}
}
