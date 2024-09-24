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

	@Post(':id')
	async webhook(
		@Param('id') integrationId: string,
		@Request() req: express.Request,
		@Response() res: express.Response
	): Promise<void> {
		const integration = await this.integrationService.findOne(integrationId, { relations: ['tenant'] })
		this.larkService.webhookEventDispatcher(integration, req, res)
	}
}
