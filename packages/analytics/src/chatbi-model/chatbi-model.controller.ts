import { IChatBIModel } from '@metad/contracts'
import { CrudController } from '@metad/server-core'
import { Body, Controller, Get, Param, Put } from '@nestjs/common'
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

	@Get('model-select-options')
	async getModelSelectOptions() {
		const { items } = await this.service.findAll()
		return items.map((item) => ({
			value: item.id,
			label: item.entityCaption
		}))
	}

	@Put(':id/roles')
	async updateRoles(@Param('id') id: string, @Body('roles') roles: string[]): Promise<IChatBIModel> {
		return await this.service.updateRoles(id, roles)
	}

}
