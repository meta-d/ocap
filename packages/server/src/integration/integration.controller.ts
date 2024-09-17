import { Controller } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CrudController } from './../core/crud'
import { Integration } from './integration.entity'
import { IntegrationService } from './integration.service'


@ApiTags('Integration')
@Controller()
export class IntegrationController extends CrudController<Integration> {
	constructor(
		private readonly integrationService: IntegrationService,
		private readonly commandBus: CommandBus
	) {
		super(integrationService)
	}
}
