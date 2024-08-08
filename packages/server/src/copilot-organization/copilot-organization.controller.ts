import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, TransformInterceptor } from '../core'
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
}
