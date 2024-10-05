import { IXpertRole } from '@metad/contracts'
import { Body, Controller, Logger, Param, Put, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, TransformInterceptor } from '@metad/server-core'
import { XpertRole } from './xpert-role.entity'
import { XpertRoleService } from './xpert-role.service'

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

	// @Put(':id/knowledgebases')
	// async updateKnowledgebases(
	// 	@Param('id') id: string,
	// 	@Body('knowledgebases') knowledgebases: string[]
	// ): Promise<IXpertRole> {
	// 	return await this.service.updateKnowledgebases(id, knowledgebases)
	// }
}
