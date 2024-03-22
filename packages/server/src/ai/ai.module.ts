import { Module } from '@nestjs/common'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { AIController } from './ai.controller'
import { CopilotModule } from '../copilot'

@Module({
	imports: [
		RouterModule.forRoutes([
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
