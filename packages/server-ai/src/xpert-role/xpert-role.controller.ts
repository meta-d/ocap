import { TXpertTeamDraft } from '@metad/contracts'
import { CrudController, ParseJsonPipe, RequestContext, TransformInterceptor, UUIDValidationPipe } from '@metad/server-core'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Query,
	UseInterceptors
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { XpertRole } from './xpert-role.entity'
import { XpertRoleService } from './xpert-role.service'
import { XpertRolePublicDTO } from './dto'
import { DeleteResult } from 'typeorm'

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

	@Post(':id/draft')
	async saveDraft(@Param('id') roleId: string, @Body() body: TXpertTeamDraft) {
		// todo 检查有权限编辑此 xpert role
		body.savedAt = new Date()
		// Save draft
		return await this.service.saveDraft(roleId, body)
	}

	@Post(':id/publish')
	async publish(@Param('id') id: string) {
		return this.service.publish(id)
	}

	@ApiOperation({ summary: 'Delete record' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The record has been successfully deleted'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Delete(':id')
	async delete(@Param('id', UUIDValidationPipe) id: string, 
		...options: any[]
	): Promise<XpertRole | DeleteResult> {
		return this.service.deleteXpert(id)
	}
}
