import { CrudController } from '@metad/server-core'
import { Controller } from '@nestjs/common'
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
}
