import { Controller, Param, Post, Request, Response } from '@nestjs/common'
import express from 'express'
import { IntegrationService } from '../integration/integration.service'
import { Public } from '../shared'
import { LarkService } from './lark.service'

@Public()
@Controller('lark/webhook')
export class LarkHooksController {
	constructor(
		private readonly larkService: LarkService,
		private readonly integrationService: IntegrationService
	) {}

	@Post(':integrationId')
	async webhook(
		@Param(':integrationId') integrationId: string,
		@Request() req: express.Request,
		@Response() res: express.Response
	) {
		const integration = await this.integrationService.findOne(integrationId)
		console.log(integration)
		return this.larkService.webhookEventDispatcher(req, res)
	}
}
