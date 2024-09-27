import { IIntegration } from '@metad/contracts'
import { Body, Controller, HttpCode, Param, Post, Request, Response } from '@nestjs/common'
import express from 'express'
import { IntegrationService } from '../integration/integration.service'
import { Public } from '../shared'
import { LarkService } from './lark.service'

@Public()
@Controller()
export class LarkHooksController {
	constructor(
		private readonly larkService: LarkService,
		private readonly integrationService: IntegrationService
	) {}

	@Post('webhook/:id')
	@HttpCode(200) // response code 200 required by lark server
	async webhook(
		@Param('id') integrationId: string,
		@Request() req: express.Request,
		@Response() res: express.Response
	): Promise<void> {
		const integration = await this.integrationService.findOne(integrationId, { relations: ['tenant'] })
		this.larkService.webhookEventDispatcher(integration, req, res)
	}

	@Post('test')
	async connect(@Body() integration: IIntegration) {
		const botInfo = await this.larkService.test(integration)
		if (!integration.avatar) {
		    integration.avatar = botInfo.avatar_url
		}
		return integration
	}
}
