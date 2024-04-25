import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { TenantModule } from '../tenant'
import { AIController } from './ai.controller'
import { CopilotModule } from '../copilot'

@Module({
	imports: [
		RouterModule.register([
			{
				path: '/ai',
				module: AIModule
			}
		]),
		TenantModule,
		CopilotModule
	],
	controllers: [AIController]
})
export class AIModule {}
